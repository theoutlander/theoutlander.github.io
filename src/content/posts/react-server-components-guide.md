---
title: "React Server Components: A Practical Guide"
published: 2024-01-20
description: "Everything you need to know about React Server Components - from basics to production patterns. No fluff, just practical knowledge."
tags: [React, Server Components, Next.js, Tutorial, Frontend]
category: Tutorial
draft: false
---

# React Server Components: A Practical Guide

React Server Components (RSC) are probably the biggest shift in React since hooks. But here's the thing - most tutorials overcomplicate them. Let me break down what you actually need to know.

## What Are Server Components?

Server Components run on the server during the build or request time. They can't use browser APIs, hooks, or event handlers. But they can do something magical - they can fetch data directly.

```tsx
// This runs on the server
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`/api/users/${userId}`).then(r => r.json());
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

No `useEffect`, no loading states, no client-side data fetching. Just... data.

## The Mental Model

Think of Server Components as "smart templates." They're like PHP or server-side rendering, but with React's component model.

- **Server Components**: Data fetching, heavy computations, static content
- **Client Components**: Interactivity, browser APIs, state management

## When to Use Each

### Use Server Components for:
- Data fetching
- Database queries
- File system operations
- Heavy computations
- Static content

### Use Client Components for:
- Event handlers (`onClick`, `onSubmit`)
- Browser APIs (`localStorage`, `window`)
- State management (`useState`, `useReducer`)
- Effects (`useEffect`)

## The "use client" Directive

This is how you opt into client-side rendering:

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

## Common Patterns

### 1. Server Component with Client Child

```tsx
// Server Component
async function BlogPost({ slug }: { slug: string }) {
  const post = await getPost(slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <LikeButton postId={post.id} />
    </article>
  );
}

// Client Component
'use client';
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

### 2. Data Fetching Pattern

```tsx
async function UserDashboard({ userId }: { userId: string }) {
  // These run in parallel on the server
  const [user, posts, comments] = await Promise.all([
    getUser(userId),
    getUserPosts(userId),
    getUserComments(userId)
  ]);
  
  return (
    <div>
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </div>
  );
}
```

## Common Gotchas

1. **Don't pass functions as props** - Server Components can't serialize functions
2. **Don't use hooks in Server Components** - They don't exist on the server
3. **Be careful with dates** - Server and client might have different timezones
4. **Don't access `window` or `document`** - They don't exist on the server

## Performance Benefits

- **Smaller bundle size** - Server Components don't ship to the client
- **Faster initial load** - Data is fetched on the server
- **Better SEO** - Content is rendered on the server
- **Reduced client-side JavaScript** - Less code running in the browser

## Getting Started

If you're using Next.js 13+, you're already set up. Just start writing Server Components and add `'use client'` when you need interactivity.

For other frameworks, you'll need to wait for broader support or use experimental implementations.

## The Bottom Line

Server Components aren't replacing Client Components - they're complementing them. Use the right tool for the job:

- Server Components for data and static content
- Client Components for interactivity and browser features

Start simple, add complexity as needed, and don't overthink it. The patterns will become second nature once you start using them.

---

*Have questions about Server Components? Hit me up on [Twitter](https://twitter.com/theoutlander) - I love talking about this stuff.*
