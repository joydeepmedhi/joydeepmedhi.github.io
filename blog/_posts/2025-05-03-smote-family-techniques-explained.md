---
layout: post
title: "SMOTE Family: Interactive Guide to Handling Imbalanced Data"
description: "How SMOTE and its variants create synthetic minority samples, when they help, when they hurt, and the resampling mistake that inflates your metrics."
last_modified_at: 2026-09-28 10:00:00 +0530
image:
  path: /assets/images/posts/smote-family-techniques-explained.jpg
  width: 1200
  height: 630
  alt: "Cover: SMOTE Family, an interactive guide to handling imbalanced data"
thumbnail: /assets/images/posts/smote-family-techniques-explained-thumb.webp
reading_time: 8
categories: [machine-learning, data-science, visualization]
---

Say you are building a fraud detector. You have 100,000 transactions and 500 of them are fraud. Your model reports **99.5% accuracy**. Then you notice it predicts "not fraud" for every transaction. It catches nothing and still scores 99.5%.

That is the class imbalance problem. When one class is rare, a model can score well by ignoring it, and the rare class is usually the one you care about: fraud, disease, defects, churn.

**SMOTE** and its variants are a popular fix. This post explains how each one works, with animations, and when it is worth using. The short answer is: less often than most tutorials suggest.

> **In short**
> - SMOTE creates new minority examples by drawing points on the line between two nearby minority examples.
> - The variants differ in *where* they create those points.
> - Resample **only the training data**. Resampling before the split makes your metrics lie.
> - SMOTE mostly trades precision for recall. It rarely makes a model better at ranking cases. Try `class_weight` and threshold tuning first.

## Why not copy the rare examples?

The simplest fix is **random oversampling**: duplicate minority rows until the classes balance. The model then sees the same 500 fraud cases many times and tends to memorise them.

SMOTE (Chawla et al., 2002) fills the space *between* minority examples instead. If two fraud cases are similar, a point halfway between them is probably fraud too.

## Standard SMOTE

Purple points are the majority class, red points the minority. Watch where the green synthetic points appear.

<div class="canvas-container">
  <canvas id="standard-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works**

1. Pick a minority sample *x*.
2. Find its *k* nearest **minority** neighbours (default *k* = 5).
3. Pick one of them at random, *x̂*.
4. Create a point on the line between them: `new = x + λ × (x̂ − x)`, with λ random in [0, 1].
5. Repeat until you have enough points.

There is no model of the data here. It is linear interpolation between neighbours.

**Where it goes wrong.** SMOTE never looks at the majority class. A mislabelled minority point deep inside majority territory will spawn new points there. SMOTE can also bridge two separate minority clusters and fill the empty gap between them. Every variant below tries to fix one of these two problems.

## Borderline-SMOTE

Minority points surrounded by other minority points are already easy to classify. Han et al. (2005) argued that new samples help most at the **border** between classes.

<div class="canvas-container">
  <canvas id="borderline-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

For each minority sample, look at its *m* nearest neighbours from **all** classes and count the majority ones:

| Majority neighbours | Label | What happens |
|---|---|---|
| Fewer than half | Safe | Skipped, already easy |
| Half or more, but not all | Danger | Used to generate new samples |
| All | Noise | Skipped, probably mislabelled |

Then run ordinary SMOTE from the "danger" points only.

**Watch for:** if the boundary itself is noisy, this concentrates new points in the noisiest region.

## ADASYN

ADASYN (He et al., 2008) makes the same idea continuous. Each minority point gets a **difficulty score**, and harder points get more synthetic neighbours.

<div class="canvas-container">
  <canvas id="adasyn-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

1. For each minority point, compute the share of majority points among its *k* neighbours: `r_i = majority / k`.
2. Normalise the scores so they sum to 1.
3. Point *i* gets `r_i × G` new samples, where *G* is the total you want.

**Watch for:** ADASYN is the most aggressive variant, so it also amplifies noise the most. In my experiment below it had the highest recall and the lowest precision.

## KMeans-SMOTE

A minority class is often several groups in disguise. "Fraud" might be three unrelated scams. Plain SMOTE can draw a line from scam A to scam C and invent a transaction that looks like neither.

KMeans-SMOTE (Douzas et al., 2018) clusters first.

<div class="canvas-container">
  <canvas id="kmeans-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

1. Run k-means on the whole dataset.
2. Keep clusters where the minority class has a reasonable share.
3. Give sparser clusters more new samples.
4. Run SMOTE **inside** each cluster, so no line crosses between clusters.

**Watch for:** more hyperparameters. In `imbalanced-learn` it raises an error when no cluster passes the balance threshold, which is common on small datasets. Lower `cluster_balance_threshold` if you hit it.

## SVM-SMOTE

Borderline-SMOTE *estimates* the boundary by counting neighbours. SVM-SMOTE (Nguyen et al., 2011) asks a classifier: it trains an SVM and uses the minority **support vectors**, the points that define the boundary, as seeds.

<div class="canvas-container">
  <canvas id="svm-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

1. Train an SVM on the original data.
2. Take the minority support vectors.
3. If few majority points surround one, **extrapolate** outward to grow the minority region. If many do, **interpolate** inward and stay safe.

**Watch for:** training an SVM is slow on large data, and the result depends on the SVM's own settings.

## The mistake that inflates everything

This is the most important section.

**Never resample before you split the data.** If you run SMOTE on the full dataset and then cross-validate, synthetic points built from a test example's neighbours end up in training. The test folds also fill up with synthetic points. The model is graded on data it helped create.

Here is the comparison on a synthetic dataset with 5% positives:

```python
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline

X, y = make_classification(n_samples=5000, n_features=10, n_informative=5,
                           weights=[0.95, 0.05], class_sep=1.0, random_state=0)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)

# WRONG: resample everything, then cross-validate
X_res, y_res = SMOTE(random_state=0).fit_resample(X, y)
wrong = cross_val_score(LogisticRegression(max_iter=1000), X_res, y_res,
                        cv=cv, scoring="precision")

# RIGHT: resampling happens inside each training fold only
pipe = Pipeline([("smote", SMOTE(random_state=0)),
                 ("model", LogisticRegression(max_iter=1000))])
right = cross_val_score(pipe, X, y, cv=cv, scoring="precision")

print(f"wrong: {wrong.mean():.2f}   right: {right.mean():.2f}")
# wrong: 0.90   right: 0.35
```

Same model, same data. Precision is **0.90** the wrong way and **0.35** the right way. Trust the first number and you ship a model that raises two false alarms for every real case.

The fix is to use `imblearn.pipeline.Pipeline`, not scikit-learn's `Pipeline`. It applies samplers during `fit` only, never during `predict` or scoring.

## So does SMOTE help?

I compared the variants with two simpler options: doing nothing, and setting `class_weight="balanced"`. Same data and cross-validation as above.

```python
from sklearn.model_selection import cross_validate
from imblearn.over_sampling import BorderlineSMOTE, ADASYN

candidates = {
    "baseline": LogisticRegression(max_iter=1000),
    "class_weight": LogisticRegression(max_iter=1000, class_weight="balanced"),
    "SMOTE": Pipeline([("s", SMOTE(random_state=0)),
                       ("m", LogisticRegression(max_iter=1000))]),
    "Borderline-SMOTE": Pipeline([("s", BorderlineSMOTE(random_state=0)),
                                  ("m", LogisticRegression(max_iter=1000))]),
    "ADASYN": Pipeline([("s", ADASYN(random_state=0)),
                        ("m", LogisticRegression(max_iter=1000))]),
}
for name, model in candidates.items():
    s = cross_validate(model, X, y, cv=cv,
                       scoring=["recall", "precision", "average_precision"])
    print(name, s["test_recall"].mean(), s["test_precision"].mean(),
          s["test_average_precision"].mean())
```

| Approach | Recall | Precision | PR-AUC |
|---|---|---|---|
| Baseline (do nothing) | 0.55 | 0.86 | **0.75** |
| `class_weight="balanced"` | 0.84 | 0.33 | 0.73 |
| SMOTE | 0.85 | 0.35 | 0.73 |
| Borderline-SMOTE | 0.82 | 0.36 | 0.74 |
| ADASYN | **0.88** | 0.24 | 0.72 |

Three things stand out:

1. **SMOTE and `class_weight` land in the same place.** One line of configuration matched the synthetic data.
2. **Recall went up and precision went down.** Resampling mostly moves the decision threshold. The model becomes more willing to say "positive".
3. **PR-AUC did not improve.** PR-AUC measures how well the model *ranks* positives above negatives. None of the methods improved that.

Research agrees. Elor & Averbuch-Elor (2022) found that with strong classifiers such as gradient-boosted trees, oversampling rarely beats tuning the decision threshold. Van den Goorbergh et al. (2022) showed that imbalance corrections distort predicted **probabilities**, which matters if anyone reads the output as "a 70% chance of fraud".

This is one dataset and one model, so treat it as a pattern to check, not a law.

## A practical checklist

1. **Pick the right metric first.** Accuracy is useless here. Use PR-AUC, recall at a fixed precision, or a cost-weighted metric.
2. **Try no resampling and tune the threshold.** This is often enough.
3. **Try `class_weight` or `scale_pos_weight`.** One line, no synthetic data.
4. **Then try the SMOTE family**, mostly with simpler models such as logistic regression or k-NN.
   - Minority class has distinct groups: **KMeans-SMOTE**.
   - Heavy overlap at the boundary: **Borderline-SMOTE** or **SVM-SMOTE**.
   - Noisy labels: be careful with **ADASYN**.
5. **Resample inside the pipeline** and cross-validate.
6. **Need calibrated probabilities?** Recalibrate after resampling (`CalibratedClassifierCV`) or skip resampling.
7. **Get more real minority data if you can.** Nothing synthetic beats it.

## Quick reference

| Method | Where it creates samples | Best when | Main risk |
|---|---|---|---|
| SMOTE | Between any minority neighbours | A simple baseline | Bridges clusters, ignores the majority |
| Borderline-SMOTE | Near the class boundary | Classes overlap at the edges | Amplifies boundary noise |
| ADASYN | More in harder regions | Difficulty varies a lot | Most sensitive to noise |
| KMeans-SMOTE | Inside minority-rich clusters | Multi-group minority class | Extra hyperparameters, fails on small data |
| SVM-SMOTE | Around SVM support vectors | A clear but sparse boundary | Slow, depends on SVM settings |

All five are in [`imbalanced-learn`](https://imbalanced-learn.org/stable/over_sampling.html) as `SMOTE`, `BorderlineSMOTE`, `ADASYN`, `KMeansSMOTE` and `SVMSMOTE`.

## References

- Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). [SMOTE: Synthetic Minority Over-sampling Technique](https://arxiv.org/abs/1106.1813). *JAIR*.
- Han, H., Wang, W.-Y., & Mao, B.-H. (2005). [Borderline-SMOTE: A New Over-Sampling Method in Imbalanced Data Sets Learning](https://doi.org/10.1007/11538059_91). *ICIC*.
- He, H., Bai, Y., Garcia, E. A., & Li, S. (2008). [ADASYN: Adaptive Synthetic Sampling Approach for Imbalanced Learning](https://doi.org/10.1109/IJCNN.2008.4633969). *IJCNN*.
- Nguyen, H. M., Cooper, E. W., & Kamei, K. (2011). [Borderline over-sampling for imbalanced data classification](https://doi.org/10.1504/IJKESDP.2011.039875). *IJKESDP*.
- Douzas, G., Bacao, F., & Last, F. (2018). [Improving imbalanced learning through a heuristic oversampling method based on k-means and SMOTE](https://arxiv.org/abs/1711.00837). *Information Sciences*.
- Elor, Y., & Averbuch-Elor, H. (2022). [To SMOTE, or not to SMOTE?](https://arxiv.org/abs/2201.08528) *arXiv*.
- van den Goorbergh, R., et al. (2022). [The harm of class imbalance corrections for risk prediction models](https://doi.org/10.1093/jamia/ocac093). *JAMIA*.

<script src="{{ site.baseurl }}/assets/js/smote-animations.js"></script>
