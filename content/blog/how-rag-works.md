---
id: "how-rag-works"
title: "A Practical Way to Think About RAG"
date: "2025-12-12T10:00:00.000Z"
cover: "/assets/images/blog/how-rag-works-cover.png"
excerpt: "A grounded mental model for Retrieval-Augmented Generation, with two concrete examples and the tradeoffs that actually matter."
tags: ["LLM", "RAG", "Architecture"]
---

Retrieval-Augmented Generation (RAG) shows up constantly in conversations about LLM applications, especially once private or fast-changing data enters the picture. What I kept noticing was a gap between two kinds of explanations. Some stayed so abstract that it was hard to tell when RAG actually helped. Others jumped straight into tools and pipelines without first explaining what problem the system was really solving.

This is the mental model I keep coming back to when evaluating RAG systems. It is not exhaustive, but it is enough to make informed design decisions and to recognize when RAG is likely to help and when it is likely to cause problems.

## Why RAG exists

Language models are strong at reasoning over text, but they operate inside a fixed knowledge boundary. They do not know your internal documents, policies, or product details unless those are explicitly provided at inference time. They also do not update themselves as your information changes.

When a question depends on knowledge outside the model’s training data, the model has no mechanism to retrieve it on its own. Without help, it fills in gaps using general patterns, which is often where hallucinations start.

RAG exists to address this limitation. It gives the model access to relevant external information at the moment it generates an answer, without retraining or fine-tuning the model itself.

That distinction matters. RAG does not make the model smarter. It makes the system more grounded.

## A useful way to think about it

The simplest way to think about RAG is as a separation of responsibilities.

The model is responsible for reasoning, synthesis, and language. The system around it is responsible for deciding what information the model should see.

If you ask a question that depends on internal context, the quality of the answer depends almost entirely on whether the right reference material was placed in front of the model first. RAG is the mechanism that performs that selection.

Once you frame it this way, most debates about RAG become debates about retrieval quality rather than model behavior. It explains why systems can feel unreliable even when the model is doing its job.

## The basic flow, with emphasis on what matters

Most RAG systems follow the same general pattern, but not all parts are equally important.

Documents are first split into chunks. These should be large enough to preserve meaning but small enough to be retrieved selectively. Chunking is one of the most underestimated parts of RAG, and it is where many systems quietly go wrong.

In practice, chunk boundaries often need to respect document structure, such as sections or paragraphs, rather than arbitrary token counts. Some overlap between chunks is also common, not to improve recall in theory, but to avoid cutting important context in half.

Each chunk is then converted into an embedding that represents its semantic meaning. When a user asks a question, the question is embedded as well, and the system retrieves the chunks that appear closest in meaning.

Embedding quality matters, but it rarely compensates for poor chunking or unclear queries. Most retrieval failures show up well before vector similarity becomes the limiting factor.

Those retrieved chunks are added to the prompt along with the user’s question. The model then generates a response based on that supplied context.

The loop itself is simple. The difficulty comes from making each step reliable under real data.

## A concrete example that usually works

Imagine an internal policy document that covers refunds, eligibility criteria, timelines, and edge cases. A user asks, “Can customers get a refund after 30 days?”

With RAG, the retrieval step might surface three chunks: one defining eligibility, one describing standard timelines, and one listing exceptions. The model answers using those specific sections instead of relying on general knowledge about refunds.

If the answer is correct, it is because retrieval surfaced the right material. If it is wrong, the problem is almost always that an important chunk was missed or that irrelevant context crowded out the relevant one.

This pattern repeats across use cases.

## A second example, where RAG often fails

A common failure case shows up in troubleshooting or operational knowledge bases.

Suppose you have a long document describing how to debug a production issue, including prerequisites, conditional steps, and warnings. A user asks a targeted question like, “Why does service X fail only after a config reload?”

Retrieval may return chunks that mention service X and config reloads, but miss a critical section explaining an ordering constraint or a hidden dependency. The model produces an answer that sounds reasonable, cites the retrieved context, and is still wrong in a way that is hard to detect.

This kind of failure is subtle. The system appears to work. The answer is coherent. But an important constraint was never retrieved, so the model could not reason about it.

This is one of the reasons RAG systems can feel unreliable in operational settings. They fail quietly when retrieval misses the one piece that actually matters.

## What RAG does well, and what it does not

RAG works best when the task involves synthesizing information from a body of text that already contains the answer. It is well suited for policy questions, documentation lookup, and knowledge-based summarization.

It is much less effective when correctness depends on precise values, strict ordering, or full coverage of edge cases. In those situations, missing context is not a minor issue. It invalidates the answer.

This is also why prompt tuning rarely fixes weak RAG systems. If retrieval is off, prompting only rearranges the same incomplete inputs.

## When RAG is the wrong choice

RAG is often treated as a default architecture, but in many cases it introduces more complexity than it removes.

If your dataset is small and stable, fine-tuning or even simple in-prompt examples may be more reliable. If the task requires deterministic outputs, structured extraction, or exact correctness, a rules-based or programmatic approach is usually safer.

RAG shines when the problem is about informed synthesis, not enforcement or computation.

## A simple way to visualize the system

Here is the basic flow. Most complexity in real systems is layered on top of this, not a replacement for it.

<img src="/assets/images/blog/rag-user-question-flow.svg" alt="drawing" width="200" style="display: block; margin: auto;"/>

### What each step does:

**User question**

Someone asks something like "Can customers get a refund after 30 days?" This triggers the RAG pipeline. The system needs to find relevant information to answer this specific question.

**Embed the question**

The question gets converted into a vector embedding that captures its semantic meaning. This is not about matching keywords. It is about what the question actually means. "Refund policy for late requests" and "Can I get my money back after a month?" would produce similar embeddings even though the words are different.

**Retrieve relevant chunks**

The system compares the question's embedding against all the chunks in your document store and finds the ones that are semantically closest. These are the chunks most likely to contain relevant information. This usually returns somewhere between 3 and 10 chunks.

**Add chunks to the prompt**

The retrieved chunks get inserted into the prompt along with the original question. Instead of just asking "Can customers get a refund after 30 days?", the system is now asking "Given these policy sections: [chunk 1, chunk 2, chunk 3], can customers get a refund after 30 days?"

**Generate a response**

The model reads the question and the context chunks, then generates an answer. It does the same reasoning it always does, but now it has the specific information it needs. The quality of this answer depends almost entirely on whether retrieval found the right chunks.

## Closing

Keeping this flow in mind helps keep systems understandable, even as more advanced techniques are layered on top.

RAG is best understood as a pattern, not a product or a feature. It is a way to control what information a language model sees at the moment it produces an answer.

Many modern systems layer additional techniques on top of this pattern, such as hybrid retrieval, reranking, or multi-step queries. These can improve results, but they do not change the underlying shape of the system. Retrieval still determines what the model can reason about. Generation determines how that reasoning is expressed.

As a starting point, this mental model is enough to decide whether RAG belongs in a system and where the real risks are. Once that’s clear, deeper implementation choices become easier to make and easier to question.
