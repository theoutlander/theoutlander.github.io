---
id: "how-to-tell-if-a-model-is-good-enough"
title: "How to Tell If a Model Is Good Enough"
date: "2026-05-10T14:30:00.000Z"
cover: "/assets/images/blog/how-to-tell-if-a-model-is-good-enough-cover.png"
excerpt: "Learn why accuracy is a trap, and how precision and recall reveal what really matters when evaluating machine learning models."
category: "Engineering"
# Tags: do not repeat the category; use only additional topics/themes.
tags: ["Machine Learning", "Metrics", "Evaluation"]
---

In late 2006, I built a sentiment classifier for MSN Shopping. Precision and recall were the gatekeepers. Those numbers decided whether the model shipped or went back for more work.

It took months of effort. Labeling data, tuning features, retraining, evaluating again. With LLMs today, the same thing can be done in minutes.

What has not changed is how you measure whether the model is actually good.

## The problem with accuracy

Accuracy is a single number that tells you how often the model is right. What it hides is what kind of wrong it was when it missed.

Missing a negative review and falsely flagging a positive one both count the same. But for a support team triaging complaints, those mistakes cost very different things.

It also breaks down completely when the data is imbalanced. If only 5% of reviews are negative, a model that calls everything positive is 95% accurate without doing anything useful at all.

## Precision: when the model says yes

Precision measures the quality of positive predictions. Out of everything the model flagged as positive, how much actually was?

<div class="concept-box">

**Precision = True positives / (True positives + False positives)**

Low precision means too many false alarms. The model flags aggressively but a lot of those flags are wrong.

</div>

A spam filter with low precision is a good example. It catches most spam, but it also routes real emails to your junk folder. The flags are not reliable enough to trust.

## Recall: what the model misses

Recall measures coverage. Out of all the things that were actually positive, how many did the model find?

<div class="concept-box">

**Recall = True positives / (True positives + False negatives)**

Low recall means too many missed cases. The model is cautious and only flags what it is very confident about.

</div>

A medical screening tool with low recall is dangerous. It might have clean, accurate flags, but it is quietly missing real cases that needed to be caught.

## What this looks like in practice

**Sentiment classifier on 1,000 electronics reviews**

100 reviews are genuinely negative.

The model flags 120 as negative.

Of those 120, only 80 are actually negative. The other 40 are positive or neutral reviews it got wrong.

Of the 100 real negative reviews, the model caught 80 and missed 20.

<div class="concept-box">

**Precision:** 80 / 120 = 67%

**Recall:** 80 / 100 = 80%

</div>

The model catches most of the real negative reviews but a third of its flags are wrong. Whether that tradeoff is acceptable depends on what you plan to do with the output. If you are surfacing complaints to a support team, false flags waste their time. If you are routing reviews for moderation, missing a real negative review is worse.

## Why you cannot have both

Precision and recall move in opposite directions. Most classifiers output a confidence score and you set a threshold to decide what counts as a positive prediction.

<!-- build-todo -->
**Note:** Want to understand how models generate these confidence scores? See [How Models Output Confidence Scores](./how-models-output-confidence-scores.md) to learn how they learn to output probabilities during training.
<!-- /build-todo -->

Raise the threshold and the model becomes more selective. Fewer false alarms, but more missed cases. Precision improves, recall drops.

Lower the threshold and the model casts a wider net. More real cases caught, but more false alarms too. Recall improves, precision drops.

The confidence threshold is the number that controls this. Every prediction comes with a score between 0 and 1. If the threshold is set to 0.8, the model only flags something when it is at least 80% confident. Lower it to 0.4 and it flags anything it is 40% sure about, catching more but also making more mistakes.

The right threshold is not a math decision. It comes from understanding which failure is more costly in your situation.

| Situation         | The costly mistake                                                                                                     | What to do                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Medical screening | Missing someone who is actually sick. An extra test is a minor inconvenience. Going undiagnosed is not.                | Optimize for recall. Lower the confidence threshold so the model flags more cases, even if some turn out to be fine.          |
| Spam filter       | A real email ending up in junk. Spam getting through is annoying. Missing an important email is worse.                 | Optimize for precision. Raise the confidence threshold so the model only blocks messages it is very sure are spam.            |
| Fraud detection   | Fraud that slips through undetected. Flagging a legitimate transaction is minor friction. Missed fraud is a real loss. | Optimize for recall. Lower the confidence threshold so more suspicious transactions get flagged, even if some are legitimate. |
| Search results    | Pages nobody wanted. A search full of noise trains people to stop trusting it.                                         | Optimize for precision. Raise the confidence threshold so only the most relevant results make it through.                     |

## Putting it in one number

When you are talking to a team and trying to align on whether the model is improving, you eventually need one number. That is what F1 is for. It is the harmonic mean of precision and recall, and it rewards balance. A model that does well on both scores high. A model that sacrifices one to game the other does not.

<div class="concept-box">

**F1 Score = 2 × (Precision × Recall) / (Precision + Recall)**

<small>Score range: 0–1 | Good: 0.8–0.9 | Perfect: 1.0 (rarely achieved)</small>

</div>

On the MSN Shopping classifier, F1 was the number we tracked. The goal was always to push it higher, which meant going back upstream. Better labeled data. More edge cases in the test set. Different features. Sometimes a different algorithm. F1 moved when the underlying work moved. That is what a good metric does. It points at the next thing to fix.

## What precision and recall actually revealed

The model that worked for electronics did not work for autos. Same architecture, same training approach, same accuracy on paper. But the precision and recall numbers told a different story when we looked at each domain separately.

Sentiment in electronics was relatively straightforward. People praise specs, complain about defects, and the language is consistent. Autos was different. A "rough ride" might be a complaint or a feature depending on whether the reviewer wanted a sports car or a sedan. Sarcasm was more common. Context mattered more.

Product reviews were full of terms that threw the model off without deeper context. The word "cancer" might mean the zodiac sign on a piece of jewelry or the disease in a personal story attached to a review. "Killer" might be praise or a complaint. "Sick" might be slang for great or a literal description of a problem. Without understanding the domain, the model picked the wrong sentiment confidently. Accuracy stayed high on average. Precision and recall on the harder cases told a different story.

We could not just retune and ship. Each new domain took roughly six months of work. New labeled data. New evaluation. New thresholds. Sometimes new features entirely. Electronics, autos, then the next category, and the next.

That is the part LLMs have genuinely changed. With prompt engineering or fine-tuning, you can adapt a single model to a new domain in days or weeks instead of months. A few well-crafted instructions, or a small set of domain-specific examples, can move the needle in ways that used to require an entire training cycle.

What has not changed is the need to measure. A clever prompt might look like it solved the problem in a few examples and still fail at scale. Fine-tuning might improve one slice while quietly hurting another. The only way to know is to evaluate precision and recall in the actual domain you care about. The shortcut is in the building. The measuring still has to be done.

Precision asks if the model can be trusted when it says yes. Recall asks if the model is finding everything that matters. Neither is meaningful in the abstract. They only matter inside the context where the model is being used, and that context changes the answer every time.

So how do you tell if a model is good enough? You measure it where it actually has to work. Precision and recall in the right domain. Anything else is a guess.
