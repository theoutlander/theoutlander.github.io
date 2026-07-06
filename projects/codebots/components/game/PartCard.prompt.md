Armory/garage row for one part card — name, weight cost, the command it grants, the idea it teaches, and its unlock state.

```jsx
<PartCard name="RADAR DISH" desc="radar() · scan() senses" weight={4} grants="radar()" idea="conditionals" status="next" />
<PartCard name="TWIN ZAPPER" desc="two barrels alternate" weight={5} grants="fire() ×2" status="locked" lockReason="CLEAR CH 05" />
```

Locked cards always show a reason, never a bare padlock.
