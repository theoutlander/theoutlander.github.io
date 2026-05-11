---
id: "how-models-output-confidence-scores"
title: "How Models Output Confidence Scores"
draft: true
date: "2025-05-10T15:00:00.000Z"
cover: "/assets/images/blog/how-models-output-confidence-scores-cover.png"
excerpt: "Models don't just say yes or no. They output a probability between 0 and 1. Here's how they learn to do it."
category: "Engineering"
tags: ["Machine Learning", "Neural Networks", "Training"]
---

When a machine learning model makes a prediction, it doesn't output a binary yes or no. It outputs a confidence score—a number between 0 and 1 that represents how sure it is about its answer. A sentiment classifier might say "this review is negative with 0.87 confidence." That 0.87 is not magic. It's the result of training.

## The basic idea

A model is a function with knobs. During training, those knobs (called weights and biases) get adjusted to match observed data. The goal is simple: when you show the model a negative review, you want it to output a high number (close to 1). When you show it a positive review, you want it to output a low number (close to 0).

The model learns this through examples. Thousands of them. Each time it makes a wrong prediction, an algorithm called backpropagation measures how wrong it was and adjusts the knobs a tiny bit. After enough iterations, the model gets better at outputting high numbers for negative reviews and low numbers for positive ones.

## How does the model know what to output?

The answer is in the loss function. This is a formula that measures "how bad was this prediction?" For classification, a common choice is cross-entropy loss.

Here's the intuition: if the true answer is "negative" and the model outputs 0.2, that's very wrong. Cross-entropy loss penalizes this heavily. If the model outputs 0.9, it's close to right, so the penalty is small. The model's job during training is to minimize this loss across all examples.

Backpropagation takes the gradient of this loss with respect to each weight, and adjusts weights in the direction that reduces loss. Do this thousands of times on thousands of examples, and the model converges to outputting probabilities that match the data.

## The final layer matters

Most classifiers use a special function in the final layer to ensure outputs are between 0 and 1. For binary classification, this is often a sigmoid function:

```
sigmoid(x) = 1 / (1 + e^(-x))
```

Whatever raw number the model computes before this final step, sigmoid squashes it into (0, 1). This guarantees a valid probability.

For multi-class problems (not just negative or positive, but many categories), models use softmax, which does the same thing: takes raw scores and converts them to a probability distribution that sums to 1.

## Why does this matter?

Because those confidence scores are what let you set a threshold. In [How to Tell If a Model Is Good Enough](./how-to-tell-if-a-model-is-good-enough.md), we talked about raising or lowering a threshold to trade off precision and recall. That threshold is a cutoff on these confidence scores.

Without understanding that scores come from training, it feels arbitrary. With this understanding, you can see why different models output different confidence distributions—they were trained on different data, with different loss functions, for different durations. A model trained to near-perfect accuracy on its training set might output very confident scores (0.99, 0.01) even when it's wrong. A model trained with regularization might be more cautious (0.6, 0.4).

The threshold you choose has to match how the model was trained. A model that outputs overconfident scores needs a different threshold than a model that's well-calibrated. That's a different article. But the point is: those scores are not arbitrary. They're the result of a deliberate training process designed to make them meaningful.

## The short version

Models learn to output confidence scores by minimizing a loss function over many examples. A loss function like cross-entropy penalizes wrong predictions, encouraging the model to assign high probability to correct answers. A final layer like sigmoid ensures the output is between 0 and 1. The confidence scores that emerge are probabilities learned from data, not guesses.
