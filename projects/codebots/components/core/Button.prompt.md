CodeBots action button — use `primary` (amber) for the ONE main action per view (▶ RUN), `ghost` for secondary (RESET, ← MISSIONS), `quiet` (dashed) for optional helpers (NEED A HINT?).

```jsx
<Button onClick={run}>▶ RUN</Button>
<Button variant="ghost" size="sm">RESET</Button>
<Button variant="quiet">NEED A HINT?</Button>
```

Labels are ALL-CAPS with glyph prefixes (▶ ■ ← →), never emoji. Min height 44px (`sm`: 36px, secondary only).
