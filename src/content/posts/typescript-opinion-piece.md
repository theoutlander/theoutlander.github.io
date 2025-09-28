---
title: "TypeScript: The Good, The Bad, and The Ugly"
published: 2024-01-25
description: "After 5+ years of TypeScript in production, here's my honest take on what works, what doesn't, and what drives me crazy."
tags: [TypeScript, Opinion, Engineering, JavaScript]
category: Opinion
draft: false
---

# TypeScript: The Good, The Bad, and The Ugly

After 5+ years of TypeScript in production environments, managing teams that use it daily, and watching it evolve from version 2.0 to 5.0+, I have some thoughts. Some of them are controversial.

## The Good (Why I Still Love It)

### 1. **Catch Errors Before Runtime**
This is the obvious one, but it's still the biggest win. I've seen TypeScript catch hundreds of bugs that would have made it to production in plain JavaScript.

```typescript
// This would be a runtime error in JS
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// TypeScript catches this immediately
calculateTotal("not an array"); // Error: Argument of type 'string' is not assignable to parameter of type 'Item[]'
```

### 2. **Better IDE Experience**
The autocomplete, refactoring, and navigation in VS Code with TypeScript is genuinely magical. I can't go back to plain JavaScript.

### 3. **Self-Documenting Code**
Types serve as living documentation. When I see `UserProfile`, I know exactly what properties it has without reading the implementation.

### 4. **Refactoring Confidence**
I can rename a property across 50 files and know it won't break anything. Try that in plain JavaScript.

## The Bad (Where It Gets Annoying)

### 1. **The Learning Curve is Real**
New developers on my team consistently struggle with TypeScript. It's not just the syntax - it's the mental model of thinking in types.

```typescript
// This looks simple but trips up junior developers
type User = {
  id: string;
  name: string;
  email?: string; // Optional property
};

// And then this pattern
function processUser(user: User | null) {
  if (user) {
    // TypeScript knows user is not null here
    console.log(user.name);
  }
}
```

### 2. **Build Times**
TypeScript compilation adds 2-3 seconds to our build process. Not huge, but it adds up when you're doing 50+ builds per day.

### 3. **Third-Party Library Types**
Some libraries have terrible type definitions. Others have none. The `@types` ecosystem is inconsistent.

```typescript
// Sometimes you get this mess
declare module 'some-library' {
  export function doThing(options: any): any;
}
```

## The Ugly (What Drives Me Crazy)

### 1. **Over-Engineering**
Developers (including me) love to show off with complex types that nobody else can understand:

```typescript
// This is actual code I wrote (and immediately regretted)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type ConditionalType<T, U, V> = T extends U ? V : never;
```

**Stop it.** Just use `Partial<T>` and move on.

### 2. **The `any` Escape Hatch**
It's too easy to reach for `any` when TypeScript gets difficult:

```typescript
// Bad: Defeats the purpose
function processData(data: any) {
  return data.someProperty.anotherProperty;
}

// Better: Actually type it
function processData(data: { someProperty: { anotherProperty: string } }) {
  return data.someProperty.anotherProperty;
}
```

### 3. **Generic Hell**
Generics can become unreadable quickly:

```typescript
// This is real code from a popular library
type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};
```

## What I Tell My Team

### 1. **Start Simple**
Don't try to be clever with types. Start with basic interfaces and build up.

### 2. **Use `unknown` Instead of `any`**
`unknown` forces you to check the type before using it:

```typescript
// Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Now TypeScript knows it's an object
    return (data as { value: string }).value;
  }
}
```

### 3. **Don't Over-Type Everything**
Sometimes a simple comment is better than a complex type:

```typescript
// This is fine
function calculateAge(birthDate: Date): number {
  // Returns age in years
  return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
```

## The Verdict

TypeScript is worth it. The benefits outweigh the costs, especially in larger codebases and teams.

But use it wisely. Don't let it become a religion. Sometimes plain JavaScript is the right choice.

The goal isn't to have perfect types - it's to have types that help you build better software faster.

---

*What's your take on TypeScript? Agree? Disagree? Let me know on [Twitter](https://twitter.com/theoutlander).*
