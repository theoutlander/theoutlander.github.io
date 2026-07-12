The bordered card everything is built from — briefing boxes, command lists, garage bays. 2px solid `--line` on `--surface-panel`.

```jsx
<Panel label="BRIEFING">Your tank is parked 8 squares west…</Panel>
<Panel active>…the current thing…</Panel>
<Panel locked>…pair with <Chip>CLEAR CH 02</Chip>…</Panel>
```

`active` = amber border + glow (one per screen max). `locked` = dashed + dimmed, always with a reason chip.
