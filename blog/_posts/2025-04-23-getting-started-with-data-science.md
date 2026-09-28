---
layout: post
title: "Getting Started with Data Science: A Beginner's Guide"
date: 2025-04-23 10:00:00 +0530
last_modified_at: 2026-09-28 10:00:00 +0530
description: "A realistic, no-hype learning path for aspiring data scientists: what to learn first, what you can safely skip, a complete first project in 30 lines of Python, and the mistakes that trip up most beginners."
image:
  path: /assets/images/posts/getting-started-with-data-science.jpg
  width: 1200
  height: 630
  alt: "Cover: Getting Started with Data Science, a beginner's guide"
thumbnail: /assets/images/posts/getting-started-with-data-science-thumb.webp
reading_time: 10
categories: [data-science, tutorial]
---

If you're starting out in data science, the internet makes it look like you need to learn *everything*: Python, R, SQL, statistics, calculus, linear algebra, deep learning, cloud platforms, MLOps, and now large language models too. Every roadmap is a wall of logos.

The good news: you don't need all of that to get started, and you definitely don't need it all at once. This post is the advice I'd give a friend: what to learn first, what can wait, a complete first project you can run today, and the mistakes I see beginners (and plenty of experienced people) make.

## What does a data scientist actually do?

Strip away the buzzwords and most of the job is answering questions with data:

- *Which customers are likely to cancel next month?*
- *Did the new checkout page actually increase sales, or was it just a busy week?*
- *Can we spot a defective part from a photo before it ships?*

Answering them usually looks like this:

1. **Understand the question.** What decision will this answer change? This step is underrated.
2. **Get and clean the data.** Honestly, this is often more than half the work.
3. **Explore it.** Plot things. Look for patterns, oddities and errors.
4. **Model it**, if a model is needed. Sometimes a well-made chart answers the question.
5. **Communicate the result** to people who weren't in the room when you did steps 1 to 4.

Notice that "train a fancy model" is only one step out of five. Beginners tend to jump straight to it; experienced people spend most of their energy on the other four.

## The learning path

Here's the order I'd recommend. The time estimates assume a few focused hours a week; go faster or slower as life allows.

### Stage 1: Python and data handling (1–2 months)

Learn enough Python to be comfortable with variables, lists, dictionaries, loops, functions and reading files. Then move quickly to the three libraries you'll use every day:

- **pandas** for loading, cleaning, filtering and grouping tables of data
- **NumPy** for fast numerical arrays (pandas is built on it)
- **Matplotlib / Seaborn** for charts

Alongside this, learn basic **SQL**. Real-world data lives in databases, and `SELECT … WHERE … GROUP BY` will take you surprisingly far.

*What you can skip for now:* R (it's great, but pick one language to start), object-oriented design patterns, and web frameworks.

### Stage 2: Statistics that actually matters (1–2 months)

You don't need a statistics degree, but you do need intuition for:

- **Distributions:** what "normal", "skewed" and "long-tailed" look like, and why the average can mislead.
- **Sampling and uncertainty:** why a result from 20 people is shakier than one from 20,000.
- **Correlation vs. causation:** ice cream sales and drownings rise together, but ice cream isn't the cause (summer is).
- **Hypothesis tests and A/B tests:** is that difference real, or just noise?

The best way to learn these is visually and with small simulations in Python, not by memorising formulas.

### Stage 3: Machine learning fundamentals (2–3 months)

Now you're ready for models. Focus on *concepts* over algorithms:

- **Supervised vs. unsupervised** learning
- **Train/test splits and cross-validation.** This is the single most important habit in the field.
- **Overfitting:** when a model memorises the training data instead of learning the pattern. Picture a student who memorises past exam answers and then fails a new question.
- **Evaluation metrics:** accuracy, precision, recall, and when each one lies to you.
- A small set of workhorse algorithms: linear/logistic regression, decision trees, random forests and gradient boosting.

For tabular data (spreadsheets and database tables), gradient-boosted trees such as XGBoost or LightGBM are still very hard to beat. Learn them well before reaching for deep learning.

### Stage 4: Specialise (ongoing)

Once the basics feel solid, follow your curiosity: computer vision, natural language processing, time series, recommendation systems, causal inference, or LLM applications. The fundamentals transfer to all of them. The maths (linear algebra, a bit of calculus) becomes more important here, and it's much easier to learn once you've seen why it matters.

## Your first complete project, in about 30 lines

Reading about data science only goes so far. Here's a small but *complete* project: load real data, split it properly, compare against a baseline, train a model and inspect its mistakes. It uses a medical dataset that ships with scikit-learn, so there's nothing to download.

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

- **Step 3 is the one beginners skip.** A model that always says "benign" already gets 63% accuracy, because 63% of the patients are benign. So "my model is 70% accurate" would be much less impressive than it sounds. Always know your baseline.
- **Step 2 happens before any tuning** so the test set stays a genuinely fresh exam.
- **Step 5 matters because not all mistakes are equal.** Calling a malignant tumour benign is far worse than the reverse. The classification report shows precision and recall *per class*, so you can see which kind of mistake the model makes.

A caveat worth being honest about: 98.6% is high because this is a clean, well-studied dataset. Real-world data is messier, and a result this good on your own project should make you *suspicious* before it makes you happy. Check for leakage first.

**Try this next:** swap in `RandomForestClassifier`, plot the most important features, or use `cross_val_score` instead of a single split and see how much the score varies.

## Mistakes that trip up almost everyone

1. **Data leakage.** Information from the test set sneaks into training, for example by scaling or filling in missing values using the *whole* dataset before splitting, or by including a column that's only known after the outcome. The result is great scores in the notebook and poor performance in reality. Pipelines (like `make_pipeline` above) prevent most of this.
2. **Trusting accuracy on imbalanced data.** If 1% of transactions are fraud, a model that never flags fraud is 99% accurate. I wrote a [whole post on this]({{ '/blog/2025/05/03/smote-family-techniques-explained/' | relative_url }}).
3. **Skipping exploration.** Plot every column. You'll find ages of 999, dates in 1900, and duplicate rows. Every real dataset has them.
4. **Tutorial hell.** Watching one more course feels productive, but you learn far more from getting stuck on your own project. Aim for roughly 30% courses and 70% building.
5. **Over-engineering.** A logistic regression you understand beats a deep network you don't, especially when you have to explain the result to someone.

## Learning in the age of AI assistants

Tools like ChatGPT, Claude and GitHub Copilot can now write most beginner-level pandas code for you. That's a genuinely useful tutor: ask it to explain an error, or why a chart looks strange. But be careful about letting it do the thinking. The valuable skills are exactly the ones an assistant can't do for you: asking the right question, noticing that the data looks off, and judging whether a result makes sense. Write the code yourself first, then compare notes with the AI.

## Resources I'd actually recommend

**Free and excellent:**

- [An Introduction to Statistical Learning](https://www.statlearning.com/) (James, Witten, Hastie, Tibshirani & Taylor). The best single book on ML fundamentals, and there's now a Python edition. Free PDF.
- [Python for Data Analysis, 3rd edition](https://wesmckinney.com/book/) by Wes McKinney, the creator of pandas. Free to read online.
- [Kaggle Learn](https://www.kaggle.com/learn): short, hands-on micro-courses on Python, pandas, SQL and ML.
- [StatQuest](https://www.youtube.com/@statquest) on YouTube: the clearest explanations of statistics and ML concepts I know.
- [3Blue1Brown's Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra) for when you're ready for the maths.
- [Practical Deep Learning for Coders](https://course.fast.ai/) (fast.ai), when you move on to deep learning.
- The [scikit-learn user guide](https://scikit-learn.org/stable/user_guide.html), which is better written than most textbooks.

**Worth paying for:**

- [Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction) by Andrew Ng (Coursera; you can audit it for free).
- *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow* by Aurélien Géron: practical and project-driven.

**Where to find data for projects:**

- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [UCI Machine Learning Repository](https://archive.ics.uci.edu/)
- [Open Government Data Platform India](https://data.gov.in/), or your own country's open data portal. Local data makes for more interesting, more original projects.

## Final thought

Data science is a long game, and everyone starts out confused. Pick one small question you're genuinely curious about, find some data, and try to answer it. Your first project will be messy. That's fine; the second will be better. One finished, honest project teaches you more than ten half-watched courses.

If you build something using this guide, I'd love to see it. Say hello on [X](https://x.com/medhijoydeep) or [LinkedIn](https://linkedin.com/in/joydeepmedhi).
