---
layout: post
title: "Advanced Computer Vision Techniques in Deep Learning"
date: 2025-04-23 10:00:00 +0530
last_modified_at: 2026-09-28 10:00:00 +0530
description: "Four ideas behind modern computer vision, from intuition to working PyTorch code: feature pyramids, self-attention, part affinity fields and self-supervised depth."
image:
  path: /assets/images/posts/advanced-computer-vision-techniques.jpg
  width: 1200
  height: 630
  alt: "Cover: Advanced Computer Vision Techniques in Deep Learning"
thumbnail: /assets/images/posts/advanced-computer-vision-techniques-thumb.webp
reading_time: 10
categories: [computer-vision, deep-learning, research]
---

Most vision problems I have worked on, from in-car assistants at Mercedes-Benz to in-store analytics in retail, come down to four questions:

- **How big is it?** A face filling the frame and a person 30 metres away need different treatment.
- **What else in the image matters?** A hand near a steering wheel means something different from a hand near a phone.
- **Which parts belong together?** With five people in view, which wrist belongs to which elbow?
- **How far away is it?** A camera sees a flat image. The world is not flat.

This post covers one idea for each question. Each section follows the same pattern: the problem, the idea, a small runnable implementation, and what to watch for. Papers are linked at the end.

## 1. Feature Pyramid Networks: big and small at once

### The problem

A backbone like ResNet works in stages. Each stage halves the resolution and makes the features more *semantic*.

- **Early layers** are high resolution. They know *where* edges and textures are, not *what* they belong to.
- **Deep layers** know "car" or "face", but each cell now covers a 32×32 patch of the image. A pedestrian 20 pixels wide shrinks to less than one cell.

Detect on early layers and the features are precise but weak. Detect on deep layers and small objects vanish.

### The idea

Think of a map. Zoomed out, you know the city but not the streets. Zoomed in, you see streets but lose context. You want **street-level detail labelled with city-level knowledge**.

A Feature Pyramid Network (Lin et al., 2017) does this. It upsamples the strong, coarse deep features and **adds** them to the detailed shallow ones. Every level of the pyramid ends up both sharp and meaningful.

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

1. **1×1 lateral convs.** Backbone stages have different channel counts (512, 1024, 2048). You cannot add tensors of different widths.
2. **Upsample with `size=`, not `scale_factor=2`.** If the input height is not divisible by 32, the stages are not exact multiples and the addition fails.
3. **3×3 smoothing convs** clean up the blocky artefacts of nearest-neighbour upsampling.

**Where you will see it:** RetinaNet, Mask R-CNN and the "neck" of YOLO-family detectors all use an FPN or a close variant.

## 2. Self-attention: every patch talks to every other patch

### The problem

A convolution sees a small neighbourhood, typically 3×3 pixels. To connect opposite corners of an image, a CNN stacks many layers until its receptive field is large enough. That is slow to learn for anything that depends on **global context**, such as whether a hand holds a phone or rests on a wheel.

### The idea

The Vision Transformer (Dosovitskiy et al., 2020) cuts the image into 16×16 patches, turns each patch into a vector called a token, and lets every token look at every other token in one layer.

It helps to think of it as search:

- Each patch writes a **query**: "I am part of a hand. What is near me?"
- Each patch publishes a **key**: "I am part of a steering wheel."
- Each patch holds a **value**: the information it shares.

Queries matched against keys give an attention score for every pair of patches. Each patch then becomes a weighted average of the values it found relevant. **Multi-head** attention runs several of these searches in parallel, so one head can track shape while another tracks position.

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

Look at the last shape: **196 × 196** attention weights per head. Every patch scores every other patch. That is also the cost. Attention grows with the *square* of the number of patches, so doubling the image resolution makes it about 16 times more expensive. High-resolution models use windowed attention (Swin) or mix convolutions with attention for this reason.

At Mercedes-Benz, a modified version of this mechanism helped driver-monitoring models track small head and eye movements across frames, where a change in one region only makes sense in the context of the whole face.

**Tip:** pure ViTs need a lot of data because they lack a CNN's built-in assumption that nearby pixels are related. On a small dataset, start from a pretrained backbone such as DINOv2.

## 3. Part Affinity Fields: which elbow goes with which wrist?

### The problem

Finding body keypoints is only half of multi-person pose estimation. With three people in frame you get three left elbows and three left wrists, and you still need to decide who owns what. "Nearest wrist" fails as soon as arms cross.

### The idea

OpenPose (Cao et al., 2017) introduced **Part Affinity Fields (PAFs)**. Next to the keypoint heatmaps, the network predicts a 2D **vector field** for each limb type. On every pixel that lies on a forearm, the field points from elbow to wrist.

Scoring a candidate link is then easy. Walk the straight line from an elbow to a proposed wrist, and at each step check whether the field points the way you are walking. A real forearm scores close to 1. A line between two different people's joints cuts across the field and scores near 0.

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

With every candidate pair scored, assigning limbs is a matching problem, which OpenPose solves greedily one limb type at a time. The cost barely grows with the number of people, so it runs in real time.

We used this bottom-up approach for gesture recognition in the MBUX Interior Assistant, where the system has to know which hand belongs to the driver and which to the passenger.

## 4. Self-supervised depth: 3D from ordinary video

### The problem

Training a network to predict depth from one image usually needs ground-truth depth from LiDAR or stereo rigs. That data is expensive and hard to scale.

### The idea

Close one eye and move your head. Near objects shift a lot and far ones barely move. That is **parallax**, and it means ordinary video already contains depth.

Self-supervised depth estimation (Zhou et al., 2017; Godard et al., 2019) turns this into a training signal:

1. A **depth network** predicts depth for frame *t*.
2. A **pose network** predicts how the camera moved between frames *t* and *t+1*.
3. With depth and motion, you can predict where each pixel of frame *t* lands in frame *t+1*, and **rebuild** frame *t* from frame *t+1*'s pixels.
4. If depth and motion are right, the rebuilt frame matches the real one. If not, it smears. The difference is the loss.

No labels needed. The video supervises itself.

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

### The loss that makes it work

The core is the **photometric loss**: how different does the rebuilt frame look from the real one? Raw pixel differences react to lighting changes, so the standard recipe blends them with SSIM, which compares local structure.

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

A bug to avoid: SSIM measures **similarity**, where 1 means identical. Convert it to `(1 − SSIM) / 2` before using it as a loss. Minimise raw SSIM and you train the network to make the rebuilt frame as *different* as possible.

**What to watch for** (Monodepth2 handles all three):

- **Moving objects** break the "only the camera moves" assumption. A car moving at your speed looks infinitely far away.
- **Occlusions.** A pixel visible in one frame may be hidden in the next. Taking the *minimum* loss over several neighbouring frames, not the average, helps a lot.
- **Scale.** One camera gives relative depth, not metres, unless you know something like the camera's height above the road.

## Where things have moved since

When I first wrote this post, I listed NeRF, CLIP and diffusion models as the things to watch. Here is how that played out:

- **3D scenes.** NeRF showed a network could represent a whole scene, but rendering was slow. **3D Gaussian Splatting** (Kerbl et al., 2023) uses millions of small coloured blobs instead and renders in real time.
- **Foundation models.** We now start from large pretrained backbones. **CLIP** links images and text, **DINOv2** gives strong general features without labels, and **SAM** segments almost anything from a click.
- **Depth.** The ideas above fed into large models such as **Depth Anything**, which give good monocular depth out of the box.
- **Vision-language models** let you ask an image questions in plain language. In retail you can ask whether a shelf is fully stocked instead of training a detector per product. I cover how they work in [Vision-Language Models and RAG, Explained]({{ '/blog/2026/09/28/vision-language-models-and-rag/' | relative_url }}).

The four techniques here did not go away. Multi-scale features, attention, part association and geometric self-supervision all live inside these larger systems, and knowing them makes the big models far less of a black box.

## Summary

| Technique | Question it answers | Core trick |
|---|---|---|
| Feature Pyramid Network | How big is it? | Add upsampled deep features to shallow ones |
| Self-attention | What else in the image matters? | Every patch queries every other patch |
| Part Affinity Fields | Which parts belong together? | Predict limb direction fields, score candidate links |
| Self-supervised depth | How far away is it? | Rebuild one video frame from another |

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
