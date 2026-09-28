---
layout: post
title: "Getting Started with Data Science: A Beginner's Guide"
date: 2025-04-23 10:00:00 +0530
last_modified_at: 2026-09-28 10:00:00 +0530
description: "A realistic learning path for aspiring data scientists: what to learn first, what to skip, a complete first project in 30 lines of Python, and the mistakes most beginners make."
image:
  path: /assets/images/posts/getting-started-with-data-science.jpg
  width: 1200
  height: 630
  alt: "Cover: Getting Started with Data Science, a beginner's guide"
thumbnail: /assets/images/posts/getting-started-with-data-science-thumb.webp
reading_time: 7
categories: [data-science, tutorial]
---

Most data science roadmaps are a wall of logos: Python, R, SQL, statistics, calculus, deep learning, cloud, MLOps, and now LLMs. You do not need all of that to start, and you do not need it at once.

This is the advice I would give a friend: what to learn first, what can wait, a complete first project you can run today, and the mistakes almost everyone makes.

## What the job is

Most of it is answering questions with data:

- Which customers will cancel next month?
- Did the new checkout page raise sales, or was it a busy week?
- Can we spot a defective part from a photo before it ships?

The work usually goes like this:

1. **Understand the question.** What decision will the answer change?
2. **Get and clean the data.** Often more than half the effort.
3. **Explore it.** Plot things. Look for patterns and errors.
4. **Model it**, if you need a model. Sometimes a good chart is the answer.
5. **Explain the result** to people who were not in the room.

Training a model is one step of five. Beginners jump straight to it. Experienced people spend most of their time on the other four.

## The learning path

The time estimates assume a few focused hours a week.

### Stage 1: Python and data handling (1 to 2 months)

Learn enough Python for variables, lists, dictionaries, loops, functions and files. Then move to the three libraries you will use every day:

- **pandas** to load, clean, filter and group tables
- **NumPy** for fast numerical arrays
- **Matplotlib** and **Seaborn** for charts

Learn basic **SQL** alongside. Real data lives in databases, and `SELECT … WHERE … GROUP BY` goes a long way.

*Skip for now:* R (pick one language first), design patterns and web frameworks.

### Stage 2: Statistics that matters (1 to 2 months)

You need intuition, not a degree:

- **Distributions:** what normal, skewed and long-tailed look like, and why an average can mislead.
- **Uncertainty:** why a result from 20 people is shakier than one from 20,000.
- **Correlation vs. causation:** ice cream sales and drownings rise together because of summer, not ice cream.
- **A/B tests:** is a difference real or noise?

Learn these with plots and small simulations, not formulas.

### Stage 3: Machine learning basics (2 to 3 months)

Focus on concepts:

- Supervised vs. unsupervised learning
- **Train/test splits and cross-validation**, the most important habit in the field
- **Overfitting:** memorising the training data instead of learning the pattern, like a student who memorises past papers and fails a new question
- **Metrics:** accuracy, precision, recall, and when each one misleads
- A few workhorse models: linear and logistic regression, decision trees, random forests, gradient boosting

For tables of data, gradient-boosted trees such as XGBoost or LightGBM are still hard to beat. Learn them before deep learning.

### Stage 4: Specialise (ongoing)

Then follow your curiosity: vision, language, time series, recommendations, causal inference or LLM applications. The basics carry over. The maths matters more here, and it is easier to learn once you have seen why it matters.

## Your first project, in about 30 lines

Here is a small but complete project: load real data, split it, compare with a baseline, train a model and look at its mistakes. It uses a medical dataset that ships with scikit-learn, so there is nothing to download.

```python
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.metrics import classification_report

# 1. Load the data into a DataFrame and actually look at it
data = load_breast_cancer(as_frame=True)
df = data.frame
print(df.shape)                        # (569, 31): 569 patients, 30 measurements + label
print(df["target"].value_counts())     # 1 = benign (357), 0 = malignant (212)

# 2. Hold out a test set BEFORE doing anything clever
X, y = df.drop(columns="target"), df["target"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, stratify=y, random_state=42)

# 3. Always start with a "dumb" baseline so you know what "good" means
baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
print("baseline accuracy:", round(baseline.score(X_test, y_test), 3))

# 4. A simple, honest model: scale the features, then logistic regression
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_train, y_train)
print("model accuracy:   ", round(model.score(X_test, y_test), 3))

# 5. Look beyond accuracy: which mistakes is the model making?
print(classification_report(y_test, model.predict(X_test),
                            target_names=["malignant", "benign"]))
```

When I run it, I get:

```
baseline accuracy: 0.629
model accuracy:    0.986
```

Why each step matters:

- **Step 3 is the one beginners skip.** A model that always says "benign" already scores 63%, because 63% of patients are benign. "My model is 70% accurate" would be much less impressive than it sounds. Know your baseline.
- **Step 2 comes before any tuning,** so the test set stays a fresh exam.
- **Step 5 matters because mistakes are not equal.** Calling a malignant tumour benign is far worse than the reverse. The report shows precision and recall per class, so you can see which mistake the model makes.

One caveat: 98.6% is high because this dataset is clean and well studied. On your own data, a result this good should make you *suspicious* first. Check for leakage.

**Try next:** swap in `RandomForestClassifier`, plot the most important features, or use `cross_val_score` and see how much the score moves.

## Mistakes almost everyone makes

1. **Data leakage.** Test information sneaks into training, for example by scaling or filling missing values on the *whole* dataset before the split, or by using a column that is only known after the outcome. Great scores in the notebook, poor results in reality. Pipelines like `make_pipeline` above prevent most of it.
2. **Trusting accuracy on imbalanced data.** If 1% of transactions are fraud, a model that never flags fraud is 99% accurate. I wrote [a whole post on this]({{ '/blog/2025/05/03/smote-family-techniques-explained/' | relative_url }}).
3. **Skipping exploration.** Plot every column. You will find ages of 999, dates in 1900 and duplicate rows.
4. **Tutorial hell.** Another course feels productive, but you learn more by getting stuck on your own project. Aim for roughly 30% courses and 70% building.
5. **Over-engineering.** A logistic regression you understand beats a deep network you do not, especially when you have to explain the result.

## Learning with AI assistants

ChatGPT, Claude and Copilot can write most beginner pandas code. Use them as a tutor: ask why an error happened or why a chart looks odd. Do not let them do the thinking. The valuable skills are the ones they cannot do for you: asking the right question, noticing that data looks wrong, and judging whether a result makes sense. Write the code yourself first, then compare.

## Resources I recommend

**Free:**

- [An Introduction to Statistical Learning](https://www.statlearning.com/) (James, Witten, Hastie, Tibshirani & Taylor). The best single book on ML fundamentals, now with a Python edition.
- [Python for Data Analysis, 3rd edition](https://wesmckinney.com/book/) by Wes McKinney, who created pandas. Free online.
- [Kaggle Learn](https://www.kaggle.com/learn): short, hands-on courses on Python, pandas, SQL and ML.
- [StatQuest](https://www.youtube.com/@statquest): the clearest explanations of statistics and ML I know.
- [3Blue1Brown's Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra), when you are ready for the maths.
- [Practical Deep Learning for Coders](https://course.fast.ai/) (fast.ai), when you move to deep learning.
- The [scikit-learn user guide](https://scikit-learn.org/stable/user_guide.html), better written than most textbooks.

**Paid:**

- [Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction) by Andrew Ng (you can audit it free).
- *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* by Aurélien Géron.

**Data for projects:**

- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [UCI Machine Learning Repository](https://archive.ics.uci.edu/)
- [Open Government Data Platform India](https://data.gov.in/), or your own country's portal. Local data makes for more original projects.

## Last word

Everyone starts out confused. Pick one small question you care about, find some data and try to answer it. The first project will be messy and the second will be better. One finished project teaches more than ten half-watched courses.

If you build something with this guide, I would like to see it. Say hello on [X](https://x.com/medhijoydeep) or [LinkedIn](https://linkedin.com/in/joydeepmedhi).
