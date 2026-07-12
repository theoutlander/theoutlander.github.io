The bot mascot — treads, hull, dome, barrel, eyes, antenna. One drawing, everywhere: boot screen, HQ, arenas, garage. Paint comes from bot.json; use paintbox tokens.

```jsx
<BotAvatar body="var(--paint-bubblegum)" dome="var(--paint-lagoon)" width={120} />
<BotAvatar width={60} eyes={false} antenna={false} facing={90} />
```

Small in-arena sizes (≤60px) usually drop eyes/antenna. Never redraw the bot with different anatomy.
