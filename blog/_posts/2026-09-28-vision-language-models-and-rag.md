---
layout: post
title: "Vision-Language Models and RAG, Explained"
date: 2026-09-28 09:00:00 +0530
description: "How vision-language models turn pixels into tokens an LLM can read, how retrieval-augmented generation grounds answers in your data, and how the two combine into multimodal RAG."
image:
  path: /assets/images/posts/vision-language-models-and-rag.jpg
  width: 1200
  height: 630
  alt: "Cover: Vision-Language Models and RAG, Explained"
thumbnail: /assets/images/posts/vision-language-models-and-rag-thumb.webp
reading_time: 12
math: true
categories: [generative-ai, computer-vision, research]
---

A large language model knows a lot, but it has two blind spots. It cannot see, and it does not know anything that was not in its training data. Vision-language models (VLMs) fix the first. Retrieval-augmented generation (RAG) fixes the second. Put them together and you get a system that can look at a photo of a shelf, look up the right product manual and answer with a source.

I built a retail voice assistant along these lines, combining RAG with VLM visual grounding. This post is the explainer I wanted when I started: what each piece does, the few equations that matter, and where things go wrong.

## Notation

| Symbol | Meaning |
|---|---|
| $$x_v$$ | an image |
| $$x_q$$ | a text query or question |
| $$f(\cdot)$$ | image encoder, returns a vector |
| $$g(\cdot)$$ | text encoder, returns a vector |
| $$z$$ | a retrieved chunk of text or a page |
| $$k$$ | number of chunks retrieved |
| $$\tau$$ | temperature, a small positive number |

## 1. How a model learns to see: CLIP

Before a language model can talk about an image, image and text need to live in the same space. The breakthrough here was **CLIP** (Radford et al. 2021).

CLIP trains two encoders side by side: an image encoder $$f$$ and a text encoder $$g$$. It learns from 400 million image and caption pairs scraped from the web. There are no class labels. The only signal is which caption belongs to which image.

Take a batch of $$N$$ pairs. Compute every image-caption similarity $$s_{ij} = \cos\big(f(x_i), g(t_j)\big)$$. That gives an $$N \times N$$ grid where the diagonal holds the true pairs. Training pushes the diagonal up and everything else down:

$$
\mathcal{L} = -\frac{1}{2N}\sum_{i=1}^{N}\left[\log\frac{e^{s_{ii}/\tau}}{\sum_{j} e^{s_{ij}/\tau}} + \log\frac{e^{s_{ii}/\tau}}{\sum_{j} e^{s_{ji}/\tau}}\right]
$$

The first term asks each image to pick its caption out of the batch. The second asks each caption to pick its image. Both are ordinary cross-entropy, which makes the code short:

```python
import torch
import torch.nn.functional as F

def clip_loss(image_emb, text_emb, temperature=0.07):
    """Symmetric contrastive loss used by CLIP.

    image_emb, text_emb: (N, d). Row i of each is a matching image-caption pair.
    """
    image_emb = F.normalize(image_emb, dim=-1)
    text_emb = F.normalize(text_emb, dim=-1)
    logits = image_emb @ text_emb.T / temperature   # (N, N) cosine similarities
    targets = torch.arange(len(logits))             # the match for row i is column i
    loss_i2t = F.cross_entropy(logits, targets)     # each image picks its caption
    loss_t2i = F.cross_entropy(logits.T, targets)   # each caption picks its image
    return (loss_i2t + loss_t2i) / 2

torch.manual_seed(0)
N, d = 8, 64
images = torch.randn(N, d)

aligned = images + 0.8 * torch.randn(N, d)   # captions close to their images
shuffled = aligned[torch.randperm(N)]         # same captions, wrong pairing

print(f"aligned pairs:  {clip_loss(images, aligned):.3f}")
print(f"shuffled pairs: {clip_loss(images, shuffled):.3f}")
# aligned pairs:  0.001
# shuffled pairs: 9.541
```

Matched pairs give a loss near zero. Shuffle the pairing and the loss jumps.

The result is a shared space where "a photo of a dog" lands near photos of dogs. That enables **zero-shot classification**: embed the prompts "a photo of a {label}" for each class and pick the one closest to the image. No task-specific training.

**SigLIP** (Zhai et al. 2023) swaps the softmax for a per-pair sigmoid. Each pair becomes a yes-or-no question, so the loss no longer needs the whole batch at once. It trains well with smaller batches and is now a common image encoder inside VLMs.

## 2. Connecting vision to a language model

CLIP can match images and text, but it cannot *talk*. A VLM adds a language model on top. The design question is how to hand visual information to the LLM.

<figure class="diagram">
<svg viewBox="0 0 760 210" role="img" aria-labelledby="fig1-title">
<title id="fig1-title">A vision-language model: image to vision encoder to projector to visual tokens, joined with text tokens and fed to an LLM</title>
<defs><marker id="arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="d-arrowhead"/></marker></defs>
<rect x="10" y="30" width="96" height="70" rx="8" class="d-box"/>
<text x="58" y="62" class="d-text" text-anchor="middle">Image</text><text x="58" y="80" class="d-muted" text-anchor="middle" font-style="italic">x<tspan baseline-shift="sub" font-size="9">v</tspan></text>
<rect x="140" y="30" width="118" height="70" rx="8" class="d-box"/>
<text x="199" y="62" class="d-text" text-anchor="middle">Vision encoder</text><text x="199" y="80" class="d-muted" text-anchor="middle">ViT (frozen)</text>
<rect x="292" y="30" width="96" height="70" rx="8" class="d-box d-acc"/>
<text x="340" y="62" class="d-text" text-anchor="middle">Projector</text><text x="340" y="80" class="d-muted" text-anchor="middle">MLP, trained</text>
<g class="d-token"><rect x="424" y="38" width="16" height="16" rx="3"/><rect x="444" y="38" width="16" height="16" rx="3"/><rect x="464" y="38" width="16" height="16" rx="3"/><rect x="484" y="38" width="16" height="16" rx="3"/></g>
<text x="462" y="78" class="d-muted" text-anchor="middle">visual tokens</text>
<g class="d-token-text"><rect x="424" y="120" width="16" height="16" rx="3"/><rect x="444" y="120" width="16" height="16" rx="3"/><rect x="464" y="120" width="16" height="16" rx="3"/></g>
<text x="462" y="160" class="d-muted" text-anchor="middle">"Is the shelf full?"</text>
<rect x="540" y="30" width="96" height="130" rx="8" class="d-box"/>
<text x="588" y="92" class="d-text" text-anchor="middle">LLM</text><text x="588" y="110" class="d-muted" text-anchor="middle">decoder</text>
<text x="700" y="100" class="d-text" text-anchor="middle">Answer</text>
<path d="M106 65 H136" class="d-line" marker-end="url(#arr1)"/>
<path d="M258 65 H288" class="d-line" marker-end="url(#arr1)"/>
<path d="M388 65 H418" class="d-line" marker-end="url(#arr1)"/>
<path d="M504 46 H536" class="d-line" marker-end="url(#arr1)"/>
<path d="M484 128 H536" class="d-line" marker-end="url(#arr1)"/>
<path d="M636 95 H664" class="d-line" marker-end="url(#arr1)"/>
</svg>
<figcaption>Fig. 1. The LLaVA-style design: image features are projected into the LLM's embedding space and read like extra words.</figcaption>
</figure>

There are three main families.

**Projection (LLaVA).** The simplest idea works well. LLaVA (Liu et al. 2023) takes patch features from a CLIP image encoder, $$Z_v = f(x_v)$$, and maps them into the LLM's word-embedding space with a small learned layer:

$$
H_v = W \cdot Z_v
$$

The LLM now sees $$H_v$$ as a sequence of "visual words" placed before the question, and generates the answer $$x_a$$ one token at a time:

$$
p(x_a \mid x_v, x_q) = \prod_{i} p_\theta\big(x_{a,i} \mid H_v,\, x_q,\, x_{a,<i}\big)
$$

Training has two stages. First, only $$W$$ is trained on 595K image-caption pairs, so the projector learns to translate. Then the projector and LLM are fine-tuned on 158K instruction-following examples generated with GPT-4. The image encoder stays frozen throughout. LLaVA-1.5 later swapped the linear layer for a two-layer MLP and higher-resolution images.

**Cross-attention (Flamingo).** Flamingo (Alayrac et al. 2022) keeps the language model frozen and inserts new *gated cross-attention* layers between its blocks. Text tokens attend to visual features through these layers. The gates start at zero, so at the beginning of training the model behaves exactly like the original LLM and learns to look at images gradually.

**Query bottleneck (BLIP-2).** BLIP-2 (Li et al. 2023) places a small transformer, the Q-Former, between a frozen image encoder and a frozen LLM. A fixed set of 32 learned queries attends to the image and returns 32 output vectors, whatever the image resolution. It is cheap because both big models stay frozen.

| Design | How vision enters the LLM | What is trained | Trade-off |
|---|---|---|---|
| Projection (LLaVA) | Visual tokens in the input sequence | Projector, then LLM | Simple; many tokens per image |
| Cross-attention (Flamingo) | New layers inside the LLM | New layers only | Keeps the LLM intact; more complex |
| Query bottleneck (BLIP-2) | Fixed number of query outputs | The Q-Former | Cheap; can lose fine detail |

Most recent open models follow the projection route. The main cost is token count. A 336×336 image cut into 14×14 patches gives 24 × 24 = 576 visual tokens, before you add any text. High-resolution images are usually tiled, which multiplies that number.

## 3. How RAG grounds answers in your data

A VLM can describe a shelf. It cannot know your store's return policy, last week's price change or a product manual published after its training. You could fine-tune the model on that data, but facts change and fine-tuning does not give you sources. **Retrieval-augmented generation** takes a different route: look the facts up at question time and put them in the prompt.

<figure class="diagram">
<svg viewBox="0 0 760 230" role="img" aria-labelledby="fig2-title">
<title id="fig2-title">RAG pipeline: offline, documents are chunked, embedded and indexed; online, a question is embedded, the top chunks are retrieved and reranked, and the LLM answers from them</title>
<defs><marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="d-arrowhead"/></marker></defs>
<text x="10" y="22" class="d-label">OFFLINE</text>
<rect x="10" y="34" width="110" height="52" rx="8" class="d-box"/><text x="65" y="65" class="d-text" text-anchor="middle">Documents</text>
<rect x="160" y="34" width="110" height="52" rx="8" class="d-box"/><text x="215" y="65" class="d-text" text-anchor="middle">Chunk</text>
<rect x="310" y="34" width="110" height="52" rx="8" class="d-box"/><text x="365" y="65" class="d-text" text-anchor="middle">Embed</text>
<rect x="460" y="34" width="130" height="52" rx="8" class="d-box d-acc"/><text x="525" y="65" class="d-text" text-anchor="middle">Vector index</text>
<text x="10" y="132" class="d-label">AT QUESTION TIME</text>
<rect x="10" y="144" width="110" height="52" rx="8" class="d-box"/><text x="65" y="175" class="d-text" text-anchor="middle">Question</text>
<rect x="160" y="144" width="110" height="52" rx="8" class="d-box"/><text x="215" y="175" class="d-text" text-anchor="middle">Embed</text>
<rect x="310" y="144" width="110" height="52" rx="8" class="d-box"/><text x="365" y="170" class="d-text" text-anchor="middle">Retrieve</text><text x="365" y="186" class="d-muted" text-anchor="middle">top-k, rerank</text>
<rect x="460" y="144" width="130" height="52" rx="8" class="d-box"/><text x="525" y="170" class="d-text" text-anchor="middle">LLM</text><text x="525" y="186" class="d-muted" text-anchor="middle">context + question</text>
<text x="690" y="166" class="d-text" text-anchor="middle">Answer</text><text x="690" y="184" class="d-muted" text-anchor="middle">with sources</text>
<path d="M120 60 H156" class="d-line" marker-end="url(#arr2)"/>
<path d="M270 60 H306" class="d-line" marker-end="url(#arr2)"/>
<path d="M420 60 H456" class="d-line" marker-end="url(#arr2)"/>
<path d="M120 170 H156" class="d-line" marker-end="url(#arr2)"/>
<path d="M270 170 H306" class="d-line" marker-end="url(#arr2)"/>
<path d="M420 170 H456" class="d-line" marker-end="url(#arr2)"/>
<path d="M590 170 H636" class="d-line" marker-end="url(#arr2)"/>
<path d="M525 86 V100 H365 V140" class="d-line d-line-acc" marker-end="url(#arr2)"/>
</svg>
<figcaption>Fig. 2. Indexing happens once, offline. At question time the system searches the index and the LLM answers from what it finds.</figcaption>
</figure>

The original RAG paper (Lewis et al. 2020) wrote this as a probability. The answer $$y$$ is generated from the question $$x$$ and a retrieved passage $$z$$, averaged over the top $$k$$ passages:

$$
p(y \mid x) \approx \sum_{z \,\in\, \text{top-}k} p_\eta(z \mid x)\; p_\theta(y \mid x, z)
$$

Here $$p_\eta(z \mid x)$$ is the retriever: how relevant passage $$z$$ is to the question. $$p_\theta(y \mid x, z)$$ is the generator: how likely the answer is given the question and that passage. Most production systems simplify this. They take the top few chunks, paste them into one prompt and generate once.

**The retriever** is usually a *dense* retriever (Karpukhin et al. 2020). Two encoders map questions and passages to vectors, and relevance is their dot product, $$E_q(x)^\top E_d(z)$$. Passage vectors are computed once and stored in a vector index, so search is a fast nearest-neighbour lookup.

Here is the whole loop in miniature. I use TF-IDF so the example runs offline; in practice you would use a dense embedding model:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1. A tiny knowledge base, already split into chunks
chunks = [
    "Returns: most items can be returned within 60 days with a receipt.",
    "Paint can be returned within 30 days if it has not been tinted.",
    "Delivery is free on orders over $500.",
    "Garden tools carry a one-year limited warranty.",
]

# 2. Index: embed every chunk once, ahead of time
#    (TF-IDF keeps this runnable offline; use a dense embedding model in practice)
vectorizer = TfidfVectorizer().fit(chunks)
index = vectorizer.transform(chunks)

def retrieve(question, k=2):
    scores = cosine_similarity(vectorizer.transform([question]), index)[0]
    top = scores.argsort()[::-1][:k]
    return [(chunks[i], round(float(scores[i]), 2)) for i in top]

# 3. Build the prompt: retrieved context first, then the question
question = "Can I return tinted paint?"
context = retrieve(question)
prompt = "Answer using only the context. If it is not there, say so.\n\n"
prompt += "\n".join(f"[{i + 1}] {text}" for i, (text, _) in enumerate(context))
prompt += f"\n\nQuestion: {question}"

for text, score in context:
    print(score, text)
print("---")
print(prompt)
```

Output:

```
0.49 Paint can be returned within 30 days if it has not been tinted.
0.13 Returns: most items can be returned within 60 days with a receipt.
---
Answer using only the context. If it is not there, say so.

[1] Paint can be returned within 30 days if it has not been tinted.
[2] Returns: most items can be returned within 60 days with a receipt.

Question: Can I return tinted paint?
```

Two details are worth noticing. The retriever put the chunk about *tinted* paint first, so the model can say no instead of guessing from the general 60-day policy. And the prompt tells the model to admit when the context does not contain the answer. Both matter more than the choice of LLM.

**The parts that decide quality:**

- **Chunking.** Chunks that are too small lose context; chunks that are too big bury the answer. Split on document structure (headings, sections, table rows) rather than a fixed character count, and keep a little overlap.
- **Hybrid search.** Dense retrieval understands paraphrases but misses exact strings such as product codes. Keyword search (BM25) catches those. Combining both is a cheap, reliable win.
- **Reranking.** Retrieve 20 to 50 candidates quickly, then re-score them with a slower cross-encoder that reads the question and passage together, and keep the best few.
- **Placement.** Models use information at the start and end of a long context better than the middle (Liu et al. 2023, "Lost in the Middle"). Put the best chunk first and do not pad the prompt with weak ones.

## 4. Putting them together: multimodal RAG

Real knowledge is not only text. It sits in scanned manuals, slides, charts, forms and product photos. There are two ways to make that searchable.

**Convert everything to text.** Run OCR and captioning over every page and image, then use ordinary text RAG. It works with existing tools, but tables, layouts and figures lose meaning when flattened, and every OCR error becomes a retrieval error.

**Search the images directly.** Embed page images with a vision model and retrieve pages, not text. **ColPali** (Faysse et al. 2024) does this with a VLM that produces one vector per image patch. Retrieval uses *late interaction*, borrowed from ColBERT (Khattab & Zaharia 2020). Each query token finds its best-matching patch, and the scores add up:

$$
s(q, d) = \sum_{i} \max_{j}\; \mathbf{q}_i^\top \mathbf{d}_j
$$

A query about "maximum load of shelf bracket" can match the patch that holds that number in a table, without any OCR. The retrieved page images then go straight to a VLM, which reads the table and answers.

The trade-off is storage. Many vectors per page cost far more than one vector per chunk, so teams often use a cheap single-vector search to shortlist pages and late interaction to rerank them.

The retail assistant I mentioned split the work the same way. The VLM grounded the question in what was in view, RAG supplied the documentation, and the LLM answered from those documents. Each model did the part it is good at.

## 5. What goes wrong, and how to measure it

**VLMs hallucinate objects.** A model asked "Is there a ladder in the image?" will sometimes say yes because ladders often appear in similar scenes. The POPE benchmark (Li et al. 2023) measures this with simple yes/no questions about objects that are or are not present. Test your model on your own images the same way before trusting its descriptions.

**Retrieval failures hide.** If the right chunk is not retrieved, the LLM will often produce a fluent, wrong answer anyway. Measure the retriever on its own: for a set of real questions, is the right chunk in the top $$k$$ (recall@k)?

**Answers drift from the sources.** Even with the right context, a model can add facts that are not there. Frameworks such as RAGAS (Es et al. 2023) score *faithfulness* (is every claim supported by the context?), *answer relevance*, and *context precision and recall*.

A simple evaluation plan:

1. Collect 50 to 100 real questions with known answers and the documents that contain them.
2. Measure retrieval recall@k on its own. Fix this first.
3. Measure answer faithfulness and correctness with the retrieved context.
4. Keep the set and rerun it after every change to chunking, models or prompts.

## 6. A practical recipe

If I were starting a multimodal assistant today:

1. **Start with text RAG** on your cleanest documents: structure-aware chunking, hybrid search and a reranker.
2. **Add a VLM** only where the input is visual: photos from users, scanned pages, charts.
3. **For document-heavy data**, compare OCR-to-text against page-image retrieval on your own evaluation set before committing.
4. **Always return sources**, and let the model say "I don't know".
5. **Evaluate retrieval and generation separately.** Most failures turn out to be retrieval failures.

The models will keep improving. The system around them, what you index, how you retrieve and how you check the answers, is where most of the quality comes from.

## References

- Radford, A., et al. (2021). [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020) (CLIP).
- Zhai, X., et al. (2023). [Sigmoid Loss for Language Image Pre-Training](https://arxiv.org/abs/2303.15343) (SigLIP).
- Alayrac, J.-B., et al. (2022). [Flamingo: a Visual Language Model for Few-Shot Learning](https://arxiv.org/abs/2204.14198).
- Li, J., et al. (2023). [BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models](https://arxiv.org/abs/2301.12597).
- Liu, H., et al. (2023). [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485) (LLaVA).
- Lewis, P., et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401).
- Karpukhin, V., et al. (2020). [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906).
- Khattab, O., & Zaharia, M. (2020). [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832).
- Faysse, M., et al. (2024). [ColPali: Efficient Document Retrieval with Vision Language Models](https://arxiv.org/abs/2407.01449).
- Liu, N. F., et al. (2023). [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172).
- Li, Y., et al. (2023). [Evaluating Object Hallucination in Large Vision-Language Models](https://arxiv.org/abs/2305.10355) (POPE).
- Es, S., et al. (2023). [RAGAS: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217).
