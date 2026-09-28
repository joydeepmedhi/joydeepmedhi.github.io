---
layout: post
title: "Advanced Computer Vision Techniques in Deep Learning"
date: 2025-04-23 10:00:00 +0530
last_modified_at: 2026-09-28 10:00:00 +0530
description: "Four ideas that quietly power modern computer vision, explained from intuition to working PyTorch code: feature pyramids, self-attention, part affinity fields and self-supervised depth."
categories: [computer-vision, deep-learning, research]
---

Most computer vision problems I've worked on, from in-car assistants at Mercedes-Benz to in-store analytics in retail, eventually come down to a handful of questions:

- **How big is the thing?** A face filling the frame and a person 30 metres away need very different treatment.
- **What else in the image matters?** A hand near a steering wheel means something different from a hand near a phone.
- **Which parts belong together?** When five people are in view, which wrist belongs to which elbow?
- **How far away is it?** A single camera sees a flat image, but the world isn't flat.

This post walks through one elegant idea for each question. For every technique I'll start with the intuition (the "why"), then show a small, **runnable** PyTorch or NumPy implementation, and finish with the practical gotchas. You don't need to have read the original papers, but I've linked them at the end if you want to go deeper.

## 1. Feature Pyramid Networks: seeing big and small at once

### The problem

A convolutional backbone like ResNet processes an image in stages. Each stage halves the resolution and makes the features more *semantic*:

- **Early layers** (high resolution) know about edges and textures. They know *where* things are, but not *what* they are.
- **Deep layers** (low resolution) know "this is a car" or "this is a face", but each pixel now covers a 32×32 patch of the original image. A 20-pixel-wide pedestrian has been squashed into less than one feature cell.

So you're stuck with a trade-off: detect on early layers and you get precise but "dumb" features; detect on deep layers and small objects vanish.

### The idea

Think of reading a map. Zoomed out, you know which city you're in, but you can't see the streets. Zoomed in, you see every street but lose context. What you actually want is **street-level detail, labelled with city-level knowledge**.

A Feature Pyramid Network (Lin et al., 2017) builds exactly that. It takes the strong, coarse deep features, upsamples them, and **adds** them to the detailed shallow features. Every level of the resulting pyramid is both high-resolution *and* semantically strong.

```
 Backbone (bottom-up)                 Pyramid (top-down)

 c5  16x16, 2048 ch  --1x1 conv-->  p5 ---------------------> detect LARGE objects
                                     | upsample x2
                                     v
 c4  32x32, 1024 ch  --1x1 conv-->  (+) --> p4 --------------> detect MEDIUM objects
                                             | upsample x2
                                             v
 c3  64x64,  512 ch  --1x1 conv-->          (+) --> p3 ------> detect SMALL objects
```

### The code

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class FeaturePyramidNetwork(nn.Module):
    def __init__(self, in_channels=(512, 1024, 2048), out_channels=256):
        super().__init__()
        # 1x1 "lateral" convs bring every backbone level to the same channel count
        self.lateral = nn.ModuleList(
            nn.Conv2d(c, out_channels, kernel_size=1) for c in in_channels)
        # 3x3 convs smooth out the aliasing introduced by upsampling
        self.smooth = nn.ModuleList(
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
            for _ in in_channels)

    def forward(self, features):
        c3, c4, c5 = features                      # high-res/weak ... low-res/strong
        p5 = self.lateral[2](c5)
        # Top-down: upsample the stronger, coarser map and add it to the finer one
        p4 = self.lateral[1](c4) + F.interpolate(p5, size=c4.shape[-2:], mode="nearest")
        p3 = self.lateral[0](c3) + F.interpolate(p4, size=c3.shape[-2:], mode="nearest")
        return [s(p) for s, p in zip(self.smooth, (p3, p4, p5))]

# Shapes from a ResNet-50 on a 512x512 image
c3 = torch.randn(1, 512, 64, 64)
c4 = torch.randn(1, 1024, 32, 32)
c5 = torch.randn(1, 2048, 16, 16)
for p in FeaturePyramidNetwork()([c3, c4, c5]):
    print(tuple(p.shape))
# (1, 256, 64, 64)
# (1, 256, 32, 32)
# (1, 256, 16, 16)
```

Three details that are easy to get wrong:

1. **The 1×1 lateral convs** are needed because backbone stages have different channel counts (512, 1024, 2048); you can't add tensors of different widths.
2. **Upsample with `size=`, not `scale_factor=2`.** If the input's height isn't divisible by 32, the stages won't be exact multiples of each other, and `scale_factor` will give you a shape mismatch at the addition.
3. **The 3×3 smoothing convs** clean up the blocky artefacts from nearest-neighbour upsampling.

**Where you'll see it:** almost every modern detector and segmenter (RetinaNet, Mask R-CNN, and the "neck" in YOLO-family models) uses an FPN or a close variant.

## 2. Self-attention: letting every part of the image talk to every other part

### The problem

A convolution only looks at a small neighbourhood, typically 3×3 pixels. To connect information from opposite corners of an image, a CNN has to stack many layers so its receptive field slowly grows. That's inefficient for things that depend on **global context**: whether a hand is holding a phone or resting on a steering wheel depends on what's elsewhere in the frame.

### The idea

The Vision Transformer (Dosovitskiy et al., 2020) cuts the image into patches (say 16×16 pixels), turns each patch into a vector (a "token"), and lets every patch look at every other patch directly, in a single layer.

The mechanism is easiest to understand as a search engine:

- Each patch writes a **query**: "I'm part of a hand. What's around me?"
- Each patch also publishes a **key**: "I'm part of a steering wheel."
- It also holds a **value**: the actual information it will share.

Matching queries against keys gives an *attention score* for every pair of patches. Each patch then updates itself as a weighted average of the values of the patches it found most relevant. **Multi-head** attention just runs several of these searches in parallel, so one head can focus on shape while another tracks colour or position.

### The code

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, embed_dim=384, num_heads=6):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.qkv = nn.Linear(embed_dim, embed_dim * 3)   # queries, keys, values in one go
        self.proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x):                                # x: (batch, tokens, dim)
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim)
        q, k, v = qkv.permute(2, 0, 3, 1, 4)             # each: (B, heads, N, head_dim)

        # How relevant is every patch to every other patch?
        attn = (q @ k.transpose(-2, -1)) * self.head_dim ** -0.5   # (B, heads, N, N)
        attn = attn.softmax(dim=-1)

        # Each patch becomes a weighted mix of the patches it attended to
        out = (attn @ v).transpose(1, 2).reshape(B, N, C)
        return self.proj(out), attn

# A 224x224 image cut into 16x16 patches -> 14 x 14 = 196 tokens
tokens = torch.randn(1, 196, 384)
out, attn = MultiHeadSelfAttention()(tokens)
print(tuple(out.shape), tuple(attn.shape))
# (1, 196, 384) (1, 6, 196, 196)
```

That last shape is worth pausing on: **196 × 196** attention weights per head. Every patch has an opinion about every other patch. It's also the catch: the cost grows with the *square* of the number of patches, so doubling the image resolution makes attention roughly 16 times more expensive. That's why high-resolution vision models use tricks like windowed attention (Swin) or combine convolutions with attention.

In my work at Mercedes-Benz, a modified version of this attention mechanism helped driver-monitoring models track subtle head and eye movements across frames, where a small change in one region only makes sense in the context of the whole face.

**Practical tip:** pure ViTs are data-hungry because they don't have a CNN's built-in assumption that nearby pixels are related. If you have a small dataset, start from a pretrained backbone (such as DINOv2) rather than training from scratch.

## 3. Part Affinity Fields: which elbow goes with which wrist?

### The problem

Detecting body keypoints (shoulders, elbows, wrists, and so on) is only half of multi-person pose estimation. With three people in frame you get three left elbows and three left wrists, and you still have to decide who owns what. Guessing "nearest wrist" fails the moment arms cross.

### The idea

OpenPose (Cao et al., 2017) introduced **Part Affinity Fields (PAFs)**. Alongside keypoint heatmaps, the network predicts a 2D **vector field** for every limb type. At every pixel that lies on, say, a forearm, the field points in the direction from elbow to wrist.

Now scoring a candidate connection is simple: walk along the straight line from the elbow to the proposed wrist and ask, at each step, *"does the field here point the same way I'm walking?"* A real forearm scores close to 1; a line between two different people's joints cuts across the field and scores near 0.

It's like checking whether a path is a real road: walk along it and see whether the road markings keep pointing where you're headed.

### The code

```python
import numpy as np

def paf_score(paf, start, end, num_samples=10):
    """How strongly does the predicted limb field support joining start -> end?

    paf:   (2, H, W) array, an x/y direction vector for one limb type at every pixel
    start: (x, y) of the first joint candidate, e.g. an elbow
    end:   (x, y) of the second joint candidate, e.g. a wrist
    """
    start, end = np.asarray(start, float), np.asarray(end, float)
    limb = end - start
    length = np.linalg.norm(limb)
    if length == 0:
        return 0.0
    direction = limb / length

    scores = []
    for x, y in np.linspace(start, end, num_samples):
        x, y = int(round(x)), int(round(y))
        if 0 <= y < paf.shape[1] and 0 <= x < paf.shape[2]:
            # Does the field at this pixel point along our candidate limb?
            scores.append(paf[:, y, x] @ direction)
    return float(np.mean(scores)) if scores else 0.0

# Toy field: a single horizontal limb along row 10, pointing right
paf = np.zeros((2, 20, 40))
paf[0, 10, 5:30] = 1.0
print(round(paf_score(paf, (5, 10), (29, 10)), 2))   # along the limb   -> 1.0
print(round(paf_score(paf, (5, 10), (29, 18)), 2))   # wrong wrist      -> much lower
```

Once every candidate pair has a score, assigning limbs becomes a matching problem (OpenPose solves it greedily, limb by limb). The key strength is that the cost is almost independent of the number of people, which makes it fast enough for real time.

We used this kind of bottom-up approach for gesture recognition in the MBUX Interior Assistant, where the system needs to know which hand belongs to the driver and which to the passenger.

## 4. Self-supervised depth: learning 3D from ordinary video

### The problem

Training a network to predict depth from a single image traditionally needs ground-truth depth: LiDAR scans or stereo rigs. That's expensive to collect and hard to scale.

### The idea

Close one eye and move your head from side to side. Nearby objects shift a lot and distant ones barely move. That's **parallax**, and it means that ordinary video already contains depth information.

Self-supervised depth estimation (Zhou et al., 2017; Godard et al., 2019) turns this into a training signal:

1. A **depth network** predicts depth for frame *t*.
2. A **pose network** predicts how the camera moved between frame *t* and frame *t+1*.
3. With depth and camera motion, you can work out where each pixel of frame *t* should appear in frame *t+1*, and **reconstruct** frame *t* by sampling pixels from frame *t+1*.
4. If depth and motion are right, the reconstruction looks like the real frame *t*. If they're wrong, it looks smeared. The difference is the loss.

No labels needed; the video supervises itself.

```
   Frame t                         Frame t+1
      |                                |
      v                                |
  Depth Net --> depth map              |
      |                                |
      +----> Pose Net <----------------+
      |        |
      |        v
      |   camera motion (R, t)
      |        |
      v        v
  Warp frame t+1 into frame t's viewpoint
                 |
                 v
  Compare with the real frame t  -->  photometric loss
```

### The code: the loss that makes it work

The heart of the method is the **photometric loss**: how different does the reconstructed frame look from the real one? Plain pixel differences are sensitive to lighting changes, so it's standard to blend them with SSIM, which compares local structure instead.

```python
import torch
import torch.nn.functional as F

def ssim(x, y, C1=0.01 ** 2, C2=0.03 ** 2):
    """Per-pixel SSIM over 3x3 windows (as used in Monodepth2). Returns values in [-1, 1]."""
    x, y = F.pad(x, (1, 1, 1, 1), mode="reflect"), F.pad(y, (1, 1, 1, 1), mode="reflect")
    mu_x, mu_y = F.avg_pool2d(x, 3, 1), F.avg_pool2d(y, 3, 1)
    sigma_x = F.avg_pool2d(x * x, 3, 1) - mu_x ** 2
    sigma_y = F.avg_pool2d(y * y, 3, 1) - mu_y ** 2
    sigma_xy = F.avg_pool2d(x * y, 3, 1) - mu_x * mu_y
    num = (2 * mu_x * mu_y + C1) * (2 * sigma_xy + C2)
    den = (mu_x ** 2 + mu_y ** 2 + C1) * (sigma_x + sigma_y + C2)
    return num / den

def photometric_loss(warped, target, alpha=0.85):
    """Lower is better: how different does the warped frame look from the real one?"""
    l1 = (warped - target).abs().mean(1, keepdim=True)
    # SSIM is a *similarity* (1 = identical), so turn it into a dissimilarity first
    dssim = ((1 - ssim(warped, target)) / 2).clamp(0, 1).mean(1, keepdim=True)
    return alpha * dssim + (1 - alpha) * l1      # per-pixel loss map

target = torch.rand(1, 3, 64, 64)
print(photometric_loss(target, target).mean().item())                  # identical -> 0.0
print(photometric_loss(torch.rand(1, 3, 64, 64), target).mean().item()) # random    -> large
```

A subtle bug to avoid: SSIM measures **similarity** (1 means identical), so it has to be converted to `(1 − SSIM) / 2` before being used as a loss. If you minimise SSIM directly, you train the network to make the reconstruction look as *different* as possible.

**Gotchas that took the field a while to work out** (Monodepth2 handles all three):

- **Moving objects** break the "only the camera moves" assumption. A car driving at the same speed as you looks infinitely far away.
- **Occlusions:** pixels visible in one frame may be hidden in the other. Taking the *minimum* loss over several neighbouring frames, rather than the average, helps a lot.
- **Scale ambiguity:** from a single camera you can recover relative depth but not absolute metres, unless you know something like the camera's height above the road.

## Where things have moved since

When I first wrote this post, I listed NeRF, CLIP and diffusion models as the things to watch. Here's how that has played out:

- **3D scenes:** NeRF showed that a neural network could represent a whole 3D scene, but rendering was slow. **3D Gaussian Splatting** (Kerbl et al., 2023) represents the scene as millions of small coloured blobs instead, and renders in real time. It has largely taken over for practical novel-view synthesis.
- **Foundation models:** instead of training every model from scratch, we now start from large pretrained backbones. **CLIP** links images and text, **DINOv2** gives excellent general-purpose visual features without labels, and **SAM** can segment almost anything from a click.
- **Depth:** the self-supervised ideas above fed into large "depth foundation models" such as **Depth Anything**, which give strong monocular depth out of the box.
- **Vision-language models** now let you *ask* an image questions in plain language. In retail, for example, you can ask whether a shelf is fully stocked instead of training a dedicated detector for every product.

The four techniques in this post haven't gone away, though. FPN-style multi-scale features, attention, part-to-part association and geometric self-supervision all live on inside these larger systems. Understanding them makes the big models much less of a black box.

## Summary

| Technique | Question it answers | Core trick |
|---|---|---|
| Feature Pyramid Network | How big is it? | Add upsampled deep features to shallow ones |
| Self-attention | What else in the image matters? | Every patch queries every other patch |
| Part Affinity Fields | Which parts belong together? | Predict limb direction fields, score candidate links |
| Self-supervised depth | How far away is it? | Reconstruct one video frame from another |

## Further reading

- Lin et al. (2017). [Feature Pyramid Networks for Object Detection](https://arxiv.org/abs/1612.03144).
- Dosovitskiy et al. (2020). [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929).
- Cao et al. (2017). [Realtime Multi-Person 2D Pose Estimation using Part Affinity Fields](https://arxiv.org/abs/1611.08050).
- Zhou et al. (2017). [Unsupervised Learning of Depth and Ego-Motion from Video](https://arxiv.org/abs/1704.07813).
- Godard et al. (2019). [Digging Into Self-Supervised Monocular Depth Estimation (Monodepth2)](https://arxiv.org/abs/1806.01260).
- Kerbl et al. (2023). [3D Gaussian Splatting for Real-Time Radiance Field Rendering](https://arxiv.org/abs/2308.04079).
- Oquab et al. (2023). [DINOv2: Learning Robust Visual Features without Supervision](https://arxiv.org/abs/2304.07193).
- Kirillov et al. (2023). [Segment Anything](https://arxiv.org/abs/2304.02643).
- Yang et al. (2024). [Depth Anything](https://arxiv.org/abs/2401.10891).

---

*Questions or corrections? I'd love to hear from you on [X](https://x.com/medhijoydeep) or [LinkedIn](https://linkedin.com/in/joydeepmedhi).*
