---
layout: post
title: "SMOTE Family: Interactive Guide to Handling Imbalanced Data"
categories: [machine-learning, data-science, visualization]
---

# SMOTE Family: Interactive Guide to Handling Imbalanced Data

Class imbalance is a common challenge in machine learning, where one class significantly outnumbers others. This imbalance can bias models toward the majority class, reducing performance on minority classes that are often more important (fraud detection, disease diagnosis, etc.).

This interactive guide explores the SMOTE family of techniques for addressing class imbalance through synthetic sample generation.

## Standard SMOTE

SMOTE (Synthetic Minority Over-sampling Technique) creates synthetic samples by interpolating between existing minority class instances.

<div class="canvas-container">
  <canvas id="standard-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How Standard SMOTE Works:**
1. For each minority class sample, find its k-nearest neighbors (default k=5)
2. Randomly select one of those neighbors
3. Create a synthetic point along the line between the sample and its neighbor
4. The position is determined by: new_point = sample + random(0,1) × (neighbor - sample)

**Advantages:**
- Simple to implement and understand
- Creates meaningful synthetic samples rather than duplicating
- Improves classifier performance for minority classes

**Limitations:**
- Doesn't consider the majority class distribution
- May generate noisy samples in overlapping regions

## Borderline-SMOTE

Borderline-SMOTE focuses on minority samples near the decision boundary, where classification is most challenging.

<div class="canvas-container">
  <canvas id="borderline-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How Borderline-SMOTE Works:**
1. Classify minority samples as "safe," "danger" (borderline), or "noise"
   - Count how many majority class instances are among each minority sample's k neighbors
   - "Danger": More than half but not all neighbors are from majority class
2. Only generate synthetic samples from the "danger" points
3. Use the standard SMOTE interpolation formula on these boundary points

**Advantages:**
- More effective for classification improvement
- Reduces noise generation in safe regions
- Focuses computational resources where most needed

## ADASYN

ADASYN (Adaptive Synthetic Sampling) generates more synthetic samples for minority instances that are harder to learn.

<div class="canvas-container">
  <canvas id="adasyn-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How ADASYN Works:**
1. Calculate a "difficulty" weight (r_i) for each minority instance
   - Based on ratio of majority samples in its neighborhood
2. Generate synthetic samples proportional to these weights
   - Harder examples (more majority neighbors) get more synthetic samples

**Advantages:**
- Adaptively shifts decision boundary toward difficult examples
- Reduces bias and variance caused by class imbalance
- Balances according to data distribution complexity

## KMeans SMOTE

KMeans SMOTE first clusters the minority class, then applies SMOTE within each cluster to maintain the natural distribution.

<div class="canvas-container">
  <canvas id="kmeans-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How KMeans SMOTE Works:**
1. Apply k-means clustering to identify clusters in feature space
2. Allocate synthetic samples to clusters based on:
   - Cluster size (minority sample count)
   - Imbalance ratio within the cluster
   - The cluster's sparsity
3. Generate synthetic samples within each cluster using SMOTE

**Advantages:**
- Respects natural data distribution
- Prevents generation across cluster boundaries
- Handles multi-modal minority distributions better

## SVM-SMOTE

SVM-SMOTE uses Support Vector Machine concepts to generate synthetic samples near the decision boundary.

<div class="canvas-container">
  <canvas id="svm-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How SVM-SMOTE Works:**
1. Train a preliminary SVM to find support vectors
2. Generate synthetic samples near minority support vectors
3. Control the direction of synthesis to avoid majority regions

**Advantages:**
- More precise decision boundary enhancement
- Reduced risk of generating noisy samples
- Effectively handles non-linear boundaries

## Implementation Guidelines

When implementing these techniques:

1. **Cross-validation is crucial** - performance gains vary across datasets
2. **Combine with undersampling** when appropriate
3. **Consider evaluation metrics** beyond accuracy (F1-score, AUC, G-mean)
4. **Domain knowledge** should guide your choice of technique

## References

- Chawla, N. V., et al. (2002). "SMOTE: Synthetic Minority Over-sampling Technique"
- Han, H., et al. (2005). "Borderline-SMOTE: A New Over-Sampling Method in Imbalanced Data Sets Learning"
- He, H., et al. (2008). "ADASYN: Adaptive Synthetic Sampling Approach for Imbalanced Learning"
- Douzas, G., et al. (2018). "Improving imbalanced learning through a heuristic oversampling method based on k-means and SMOTE"
- Nguyen, H. M., et al. (2011). "Borderline over-sampling for imbalanced data classification"

<script src="{{ site.baseurl }}/assets/js/smote-animations.js"></script>