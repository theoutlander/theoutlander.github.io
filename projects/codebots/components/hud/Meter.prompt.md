HUD meter for the four vitals — SCORE (use `color="amber"`, `suffix=""`), ARMOR (auto-color), SPEED (`cyan`), CHARGE (`amber`). Auto-color drops green→amber→red as value falls.

```jsx
<Meter label="ARMOR" value={61} />
<Meter label="CHARGE" value={40} color="amber" />
```
