---
layout: post
title: "SMOTE Family: Interactive Guide to Handling Imbalanced Data"
description: "An interactive, plain-English guide to SMOTE and its variants: how each one invents new minority samples, when it helps, when it quietly hurts, and the one mistake that makes results look far better than they are."
last_modified_at: 2026-09-28 10:00:00 +0530
categories: [machine-learning, data-science, visualization]
---

Imagine you're building a fraud detector. You have 100,000 transactions, and 500 of them are fraud. You train a model, it reports **99.5% accuracy**, and you feel great, until you notice it predicts "not fraud" for *every single transaction*. It never catches anything, and it's still 99.5% accurate.

That's the class imbalance problem in one paragraph. When one class vastly outnumbers another, a model can score well by simply ignoring the rare class. And the rare class is usually the one we care about: the fraud, the disease, the defective part, the customer about to churn.

One popular family of fixes is **SMOTE** and its descendants. This post walks through how each one works, with animations you can watch. I'll also be honest about when they actually help, because the answer is "less often than most tutorials suggest".

> **TL;DR**
> - SMOTE creates *new, synthetic* minority examples by drawing points on the line between two nearby minority examples.
> - Its variants differ mainly in **where** they choose to create those points (near the boundary, in hard regions, inside clusters, around support vectors).
> - Resample **only the training data**, never before your train/test split. Otherwise your metrics lie.
> - SMOTE usually shifts the trade-off between catching positives (recall) and being right when you flag one (precision). It rarely makes the model better at *ranking* cases. Try `class_weight` and threshold tuning first.

## First, why not just copy the rare examples?

The simplest fix is **random oversampling**: duplicate minority examples until the classes are balanced. It works to a degree, but the model sees the exact same 500 fraud cases again and again, so it tends to *memorise* them. It learns tight little bubbles around those specific points instead of the general shape of "what fraud looks like".

SMOTE's idea (Chawla et al., 2002) was to fill in the space *between* known minority examples instead of copying them. If two fraud cases are similar, a transaction halfway between them is plausibly fraud too.

## Standard SMOTE: connect the dots

In the animation below, purple points are the majority class and red points are the minority. Watch how new green points get created.

<div class="canvas-container">
  <canvas id="standard-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works, step by step:**

1. Pick a minority sample. Call it *x*.
2. Find its *k* nearest **minority** neighbours (default *k* = 5).
3. Randomly choose one of those neighbours, *x̂*.
4. Pick a random spot on the line between them:

   `new_point = x + λ × (x̂ − x)`, where λ is a random number between 0 and 1.

5. Repeat until you have as many synthetic points as you want.

That's genuinely all there is to it. There's no model of the data distribution; it's just linear interpolation between neighbours.

**Where it goes wrong:** SMOTE looks only at minority points when choosing neighbours. It has no idea where the majority class is. If a minority point sits deep inside majority territory (a noisy label, say), SMOTE will happily draw new points into that territory and teach the model that this region is minority. It can also bridge two separate minority clusters, placing points in the empty gap between them.

Every variant below is essentially an attempt to fix those two blind spots.

## Borderline-SMOTE: focus on the fight

The key observation from Han et al. (2005): minority points that are surrounded by other minority points are already easy to classify, so creating more of them is wasted effort. The action is at the **border**, where the two classes meet.

<div class="canvas-container">
  <canvas id="borderline-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works:** for each minority sample, look at its *m* nearest neighbours drawn from **all** classes and count how many belong to the majority:

| Majority neighbours | Label | What Borderline-SMOTE does |
|---|---|---|
| Fewer than half | **Safe** | Leaves it alone, it's already easy |
| Half or more, but not all | **Danger** (borderline) | Generates synthetic samples from it |
| All of them | **Noise** | Ignores it, probably a mislabelled or outlier point |

Then it runs ordinary SMOTE interpolation, but only starting from the "danger" points.

**The intuition:** think of a teacher who spends extra time on the questions students almost get right, rather than the ones everyone already aces or the ones nobody could possibly answer.

**Watch out for:** if your data is genuinely noisy near the boundary, you're now concentrating synthetic points in exactly the noisiest area.

## ADASYN: more help where it's harder

ADASYN (He et al., 2008) takes Borderline-SMOTE's idea and makes it continuous. Instead of a hard safe/danger/noise split, every minority point gets a **difficulty score**, and harder points get proportionally more synthetic neighbours.

<div class="canvas-container">
  <canvas id="adasyn-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works:**

1. For each minority point *i*, find its *k* nearest neighbours and compute the fraction that are majority: `r_i = (majority neighbours) / k`.
2. Normalise these so they sum to 1. Now each point has a share of the "synthetic budget".
3. Point *i* gets `r_i × G` new samples, where *G* is the total number you want to create.

A minority point surrounded by majority neighbours might get ten synthetic neighbours, while one in a comfortable minority cluster gets none.

**Watch out for:** ADASYN is the most aggressive of the family. Because it pours samples into the hardest regions, it's also the most likely to amplify noise and outliers. In my experiments below it gave the highest recall and the lowest precision.

## KMeans-SMOTE: respect the clusters

Real minority classes are often **multimodal**. "Fraud" might really be three different scams that look nothing like each other. Standard SMOTE can draw a line from scam A to scam C and invent a transaction that looks like neither.

KMeans-SMOTE (Douzas et al., 2018) fixes this by clustering first.

<div class="canvas-container">
  <canvas id="kmeans-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works:**

1. Run k-means on the **whole** dataset.
2. Keep only the clusters where the minority class has a decent share (so you're not generating inside majority strongholds).
3. Give **sparser** clusters a bigger share of the synthetic samples, because dense ones are already well represented.
4. Run SMOTE **inside** each cluster, so a new point never bridges two clusters.

**Watch out for:** you now have extra hyperparameters (the number of clusters, the imbalance threshold). In `imbalanced-learn`, KMeans-SMOTE will raise an error if no cluster passes the threshold, which happens often on small datasets. Lower `cluster_balance_threshold` if you hit it.

## SVM-SMOTE: let a classifier find the boundary

Borderline-SMOTE *guesses* where the boundary is by counting neighbours. SVM-SMOTE (Nguyen et al., 2011) asks a classifier directly: it trains an SVM and uses the minority **support vectors**, the points that literally define the decision boundary, as seeds.

<div class="canvas-container">
  <canvas id="svm-smote-canvas" width="700" height="400" class="border rounded"></canvas>
</div>

**How it works:**

1. Train an SVM on the original data.
2. Take the minority-class support vectors.
3. For each one, look at its neighbourhood:
   - If majority points are sparse around it, **extrapolate**: push new points *outward* to expand the minority region.
   - If majority points are dense, **interpolate** conservatively *inward* so you don't invade majority space.

**Watch out for:** you're training an SVM just to do preprocessing, which gets slow on large datasets. And the result depends on the SVM's own hyperparameters.

## The mistake that makes everything look amazing

This is the single most important section of the post.

**Never resample before splitting your data.** If you run SMOTE on the full dataset and then do cross-validation, synthetic points created from a test example's neighbours leak into training. Worse, your test folds are now full of synthetic points too. The model is being graded on data it essentially helped create.

Here's a real comparison I ran on a synthetic dataset with 5% positives:

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

The same model gets a precision of **0.90** the wrong way and **0.35** the honest way. If you only saw the first number, you'd ship a model that raises almost two false alarms for every real case.

The fix is simple: use `imblearn.pipeline.Pipeline` (not scikit-learn's own `Pipeline`). It knows to apply samplers during `fit` only, and never during `predict` or scoring.

## So... does SMOTE actually help?

Here's the part many tutorials skip. I compared the variants against two much simpler options: doing nothing, and just setting `class_weight="balanced"`. The data and cross-validation are the same as above.

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

Three things jump out:

1. **SMOTE and `class_weight` land in almost the same place.** One line of configuration did what the synthetic data did.
2. **Recall went up, precision went down.** Resampling mostly moves the model's decision threshold. It makes the model more willing to say "positive".
3. **PR-AUC didn't improve at all.** PR-AUC measures how well the model *ranks* positives above negatives, independent of threshold. None of the methods made the model better at telling the classes apart; they just changed where it draws the line.

This matches the research. Elor & Averbuch-Elor (2022) found that with strong classifiers such as gradient-boosted trees, oversampling rarely beats simply tuning the decision threshold. Van den Goorbergh et al. (2022) showed that imbalance corrections can badly distort predicted **probabilities**, which matters a lot if anyone downstream reads the model's output as "a 70% chance of fraud".

It's one synthetic dataset and one model, so don't treat these numbers as universal. But it's a pattern worth checking on your own data.

## A practical checklist

When I face an imbalanced problem, I work through roughly this order:

1. **Pick the right metric first.** Accuracy is useless here. Use PR-AUC, recall at a fixed precision, or a cost-weighted metric that reflects what a missed case and a false alarm actually cost.
2. **Try doing nothing, and tune the threshold.** Train normally, then choose the probability cutoff that gives the precision/recall balance you need. This is often all you need.
3. **Try `class_weight` / `scale_pos_weight`.** It's one line, adds no synthetic data, and is usually as good as SMOTE.
4. **Then try the SMOTE family**, especially with simpler models (logistic regression, k-NN, small networks), which tend to benefit more than boosted trees.
   - Minority class looks like several distinct groups? Try **KMeans-SMOTE**.
   - Classes overlap a lot at the boundary? Try **Borderline-SMOTE** or **SVM-SMOTE**.
   - Noisy labels? Be careful with **ADASYN**.
5. **Always resample inside the pipeline**, and cross-validate.
6. **If you need calibrated probabilities**, recalibrate after resampling (e.g. `CalibratedClassifierCV`) or avoid resampling altogether.
7. **Get more real minority data if you possibly can.** No synthetic method beats real examples.

## Quick reference

| Method | Where it creates samples | Best when | Main risk |
|---|---|---|---|
| SMOTE | Between any minority neighbours | A simple baseline | Bridges clusters, ignores the majority |
| Borderline-SMOTE | Near the class boundary | Classes overlap at the edges | Amplifies boundary noise |
| ADASYN | More in harder regions | Difficulty varies a lot | Most sensitive to noise |
| KMeans-SMOTE | Inside minority-rich clusters | Multi-modal minority class | Extra hyperparameters, can fail on small data |
| SVM-SMOTE | Around SVM support vectors | A clear but sparse boundary | Slow, depends on SVM settings |

All five are available in [`imbalanced-learn`](https://imbalanced-learn.org/stable/over_sampling.html) as `SMOTE`, `BorderlineSMOTE`, `ADASYN`, `KMeansSMOTE` and `SVMSMOTE`.

## References

- Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). [SMOTE: Synthetic Minority Over-sampling Technique](https://arxiv.org/abs/1106.1813). *JAIR*.
- Han, H., Wang, W.-Y., & Mao, B.-H. (2005). [Borderline-SMOTE: A New Over-Sampling Method in Imbalanced Data Sets Learning](https://doi.org/10.1007/11538059_91). *ICIC*.
- He, H., Bai, Y., Garcia, E. A., & Li, S. (2008). [ADASYN: Adaptive Synthetic Sampling Approach for Imbalanced Learning](https://doi.org/10.1109/IJCNN.2008.4633969). *IJCNN*.
- Nguyen, H. M., Cooper, E. W., & Kamei, K. (2011). [Borderline over-sampling for imbalanced data classification](https://doi.org/10.1504/IJKESDP.2011.039875). *IJKESDP*.
- Douzas, G., Bacao, F., & Last, F. (2018). [Improving imbalanced learning through a heuristic oversampling method based on k-means and SMOTE](https://arxiv.org/abs/1711.00837). *Information Sciences*.
- Elor, Y., & Averbuch-Elor, H. (2022). [To SMOTE, or not to SMOTE?](https://arxiv.org/abs/2201.08528) *arXiv*.
- van den Goorbergh, R., et al. (2022). [The harm of class imbalance corrections for risk prediction models](https://doi.org/10.1093/jamia/ocac093). *JAMIA*.

<script src="{{ site.baseurl }}/assets/js/smote-animations.js"></script>
