# CodeBots UI kit

Static recreation of the game's two core surfaces, built purely from `styles.css` tokens:

- **HQ** — home base with the four doors (CAMPAIGN / GARAGE / BOT MAKER / PLAY), pilot + bot chips, stars & coins.
- **MISSION** — the core loop: briefing + commands (left), arena with grid/beacon/crate/steel/bot + HUD meters (center), program editor with active-line highlight + RUN/RESET + tank radio (right).

Toggle between them with the button in the header. Source of truth for the live behavior: `CodeBots.dc.html` at project root (the playable prototype) and `PRODUCT_SPEC.md` §10.
