# Unintended Side Effects: Night Shift (v0.1)

A 2D top-down, room-based roguelite set in a haunted hospital where your **mind is the map**.  
Explore procedurally generated wards, swap between **Awake** and **Asleep** layers, and collect clinical-coded “treatments” that alter your reality in unpredictable ways.  
Think *Enter the Gungeon* pace and navigation, *Binding of Isaac* build variety, and a **dual-layer Awake/Dream mechanic** at the core.

## Play

- Local development (hot reload):
  - `npm install`
  - `npm run dev` → open the printed Local URL
  - Notes: Uses Vite to resolve `import Phaser from 'phaser'` and other ESM imports.

- Production (GitHub Pages):
  - Live build: [walterreid.github.io/Unintended-Side-Effects](https://walterreid.github.io/Unintended-Side-Effects/)
  - Build locally: `npm run build` → outputs to `docs/` (served by Pages)
  - Tested targets: Chromium‑based desktop browsers and Safari desktop.


---

## Premise
“You’re awake.” The PA crackles overhead, but the halls are wrong. The lights hum like bees. You carry a chart with someone else’s name.  
To escape, you must recover **3 Coping Shards**, confront the **ward boss**, and discharge yourself before the **Night Audit** seals the hospital forever.

- **Awake Layer**: Clinical reality — security doors, med carts, alarms.
- **Asleep Layer**: Surreal dream logic — warped rooms, strange loot, demons given shape.
- **Goal**: Gather shards, face the boss, escape before the audit countdown hits zero.

---

## Core Loop
1. **Admit**: Spawn in a procedurally generated ward with seed-based layout.
2. **Explore & Loot**: Clear rooms, find weapons, traits, and consumables.
3. **Shift Layers**: Swap Awake/Asleep to solve room puzzles, access locked loot, or fight enemies in their domain.
4. **Collect 3 Coping Shards**: Triggers boss spawn.
5. **Defeat Boss**: Starts the Night Audit countdown.
6. **Escape**: Reach the exit elevator before time expires.

---

## Controls (Top-Down)
- **Move**: WASD / Arrow Keys
- **Aim & Shoot**: Mouse
- **Dash/Dodge**: Space (brief i-frames)
- **Layer Swap**: Q (consumes Insight)
- **Interact**: E (doors, loot, NPCs)
- **Pause**: P

---

## Weapons — “Treatments”
Clinical-coded firearms and devices. Examples:
- **Mood Stabilizer**: Reliable semi-auto.
- **Anxiolytic**: High ROF SMG; reduces stress build-up while firing.
- **Beta Blocker**: Marksman pistol; slows time while aiming.
- **Electroconvulsive Arc**: Short-range arc gun; stuns enemies.
- **Placebo**: Low damage, high trait synergy.

---

## Traits — “Unintended Side Effects”
Stackable positive/negative effects that define your build.
- **Titration**: Stats shift with each pickup; stabilize at stations to lock in.
- **Therapeutic Window**: Bonus damage when HP is between 40–70%.
- **Withdrawal**: Reloads hurt you but lower dash cooldown.
- **REM Thief**: Dream kills restore Insight.
- **White Noise**: Standing near machines grants crit chance.

---

## Loot Types
- **Weapons** (replace or swap with current)
- **Traits** (stackable build modifiers)
- **Consumables** (medkits, Insight refills, one-use buffs)
- **Keys/Special Items** (badge access, dream sigils)

---

## Procedural Generation
- Seed-based, consistent for the same run.
- Graph of rooms: combat, loot, story/event, boss arena.
- Awake/Dream variants share geometry but differ in enemies and interactables.

---

## Enemies
- Designed for slower, tactical combat — not bullet hell.
- Examples:
  - **Rumination**: Orbiting thought-mites.
  - **Panic**: Sprint attackers that distort audio on approach.
  - **Anhedonia**: Drains color saturation while near.
  - **Inner Critic**: Debuffs aim.

---

## Story/Intrigue
- Short text overlays during key moments (e.g., shard pickups, boss defeat).
- Environmental storytelling via props and room dressing.
- Dream versions of rooms reveal hidden messages.

---


## Tech
- Phaser 3.60.x via npm (Vite build; ESM only, no CDN scripts).
- ES module imports.
- Modular scene/system structure.

### Hosting & Build (GitHub Pages)

- Vite config sets `base: '/Unintended-Side-Effects/'` and outputs to `docs/` so Pages can serve from `main/docs`.
- Deploy steps:
  1. `npm run build` → generates `docs/index.html` and assets.
  2. Commit `docs/` and push to `main`.
  3. In repo Settings → Pages: Source = “Deploy from a branch”, Branch = `main`, Folder = `/docs`.
  4. Visit: `https://<username>.github.io/Unintended-Side-Effects/`.
- If you rename the repo, update `vite.config.js` `base` to match (`'/' + repoName + '/'`).
- Do not use `<script>` CDN tags in `index.html`. Phaser is bundled from npm by Vite.

### Current Build Specifics

- Top‑down movement; gravity disabled in `BootScene`.
- Dash on Space with brief i‑frames.
- Awake/Dream share geometry; Dream spawns fewer enemies and uses tinted visuals.
- Procedural layout includes room types: `start`, `combat`, `loot`, `event`, `boss`, `exit`.
- Weapons archetypes: pistol, SMG, marksman, shotgun, beam, charge‑shot (beam/charge are represented with simple placeholders for now).
- Traits system provides starting modifiers; seed is persisted for quick “Continue Last Run”.
- HUD (`UIScene`) shows HP/Insight/Audit placeholder and loadout (weapon, shards, traits).

---

### Suggested Folder Structure

```
/ (root)
  index.html
  /src
    main.js
    /scenes
      BootScene.js
      MenuScene.js
      WardScene.js        // Awake layer
      DreamScene.js       // Asleep layer
      BossScene.js
      UIScene.js
    /systems
      procgen.js          // seeded graph, locks/keys, loot tables
      traits.js           // unintended side effects
      weapons.js          // treatments
      enemies.js          // manifestations + bosses
      metrics.js          // stress/insight/audit
      save.js             // localStorage
  /assets (placeholder)
    /audio
    /fonts
    /sprites
```

## Phase Roadmap (Lite)

### Phase 1 — Core Playable Loop
- Top-down movement, dash, shooting.
- Procedural rooms with doors.
- Awake/Dream swap (visual + loot/enemy changes).
- Weapons, traits, and consumable pickups.
- 1 boss, Night Audit countdown, win/lose screen.

### Phase 2 — Content Expansion
- +2 bosses, more weapon archetypes.
- Additional traits (positive/negative).
- First pass on story/event rooms.

### Phase 3 — Layer Integration
- Awake/Dream puzzles (locked loot, alternate paths).
- Insight economy balance.
- Layer-specific enemies.

### Phase 4 — Narrative & Intrigue
- Environmental storytelling.
- Branching room events with choices.
- Chart Fragment system (unlock secret ending).

### Phase 5 — Polish & Meta
- Daily seed mode.
- Meta progression (unlock new wards, traits).
- Accessibility options, controller support.

---

## Troubleshooting

* Clipboard (copy seed/run code) may require HTTPS or `http://localhost`.
* If audio is muted on first interaction, click once inside the game to unlock audio context (browser policy).
* Performance low? Disable screen shake and reduce particle budget in Options.

## License

TBD. Phaser © Photon Storm Ltd. See Phaser’s license for details.
