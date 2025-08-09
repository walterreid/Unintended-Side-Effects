# Unintended Side Effects: Night Shift (v0.1)

A 2D, seed‑driven roguelite set in a haunted hospital where your **mind is the map**. Explore procedurally generated wards, shift between **Awake** and **Asleep** layers, and wield clinical‑coded “treatments” against very real demons. Think: *Mooncrash (Prey 2017) in 2D* meets *hospital psych‑horror* — with emoji‑aided UI when in doubt. 😶‍🌫️💊

---

## Play

* Open `index.html` in a modern desktop browser or serve locally (recommended for audio/clipboard APIs):

  * `python3 -m http.server 8080` → visit `http://localhost:8080`
  * `npx serve --single --listen 8080` → visit `http://localhost:8080`
* Tested targets: Chromium‑based desktop browsers and Safari desktop.

## Premise

“You’re awake.” The hospital PA crackles. Except the corridors are wrong, fluorescent light hums like a hive, and a **code blue** echoes from a floor that doesn’t exist. You carry a chart with someone else’s name. To get out, you must stabilize the **patient** (you), recover your scattered **Coping Shards**, and discharge yourself before the **Night Audit** seals the doors at dawn.

* **Awake Layer**: Clinical reality — alarms, access badges, meds, staff rooms, locked doors.
* **Asleep Layer**: Dream logic — impossible loops, memory echoes, demons given shape.
* **Goal**: Gather shards, confront a ward boss, reconcile your chart, and reach the exit **before the Night Audit countdown hits 0**.

## Controls (default)

* **Move**: WASD / Arrow Keys
* **Jump**: Space (traits can grant double/triple jumps)
* **Sprint**: Shift
* **Aim & Shoot**: Mouse / Left‑Click (hold to charge if trait allows)
* **Blink / Dash**: Right‑Click (trait‑gated)
* **Layer Shift (Awake⇄Asleep)**: Q (consumes **Insight**)
* **Interact**: E (doors, terminals, med carts)
* **Pause**: P  •  **Restart Run**: R

## Game Loop

1. **Admit**: Spawn at **Triage** with a randomized loadout seeded by the run.
2. **Stabilize**: Collect **3 Coping Shards** (🧩) scattered through the current ward.
3. **Confront**: A ward boss manifests after the final shard.
4. **Discharge**: The **Night Audit** begins (global collapse). Sprint for the exit elevator (⬇️) before time expires.

### Session Types

* **Custom Seed**: Enter any string for deterministic generation.
* **Continue Last**: Re‑run your last seed.
* **Daily Rotation**: Uses current **New York date** (America/New\_York) as a shared daily seed.
* **Story Start**: Forces the tutorial set — begins with **“You’re awake.”**

## Procedural Generation

* **Rooms & Flow**: Weighted graph of wards with alternate Awake/Asleep variants; secret vents and maintenance chutes connect non‑adjacent spaces.
* **Locks & Keys**:

  * **Badge Access** (🔑): Color‑coded by department (ICU, Radiology, Pharmacy, Sleep Lab).
  * **Consent Forms** (📄): Single‑use paper keys that open ethical locks.
  * **Dream Sigils** (✨): Asleep‑only keys that “soft‑unlock” reality doors after a layer shift.
* **Loot**: Med carts, crash carts, supply closets, lost & found, dream caches.
* **Events**: Code Blue chases, power flickers, false alarms, memory echos (as miniboss rooms).

## Weapons — “Treatments”

Clinical‑coded guns with subtle side‑effects. Names are intentionally sterile; effects are anything but.

* **Mood Stabilizer** (sidearm): Reliable semi‑auto. 🎯
* **Anxiolytic** (SMG): High ROF; recoil suppresses panic (reduces screen shake) while firing.
* **SSRI Burst** (burst pistol): Delayed strength—damage ramps the longer you stay on target.
* **Beta Blocker** (marksman): Slows time slightly on ADS; heart‑rate crosshair steadies.
* **Electroconvulsive Arc** (shotgun): Wide arc; stuns on close contact; drains Insight.
* **Placebo** (???): Low base damage, high synergy with trait procs. Sometimes… it just works. 😉

## Traits — “Unintended Side Effects”

30+ stackable modifiers. A few examples:

* **Titration**: Each pickup slightly alters stats; stabilize at stations to lock gains.
* **Therapeutic Window**: Bonus damage when health is between 40–70%.
* **Withdrawal**: Reloads hurt but speed up dash cooldown.
* **Cross‑Taper**: Swapping weapons grants a brief damage buff.
* **REM Thief**: On Asleep kills, gain Insight; Awake kills spawn a guilt wisp.
* **Night Float**: +1 air jump; fall speed reduced after a sprint.
* **White Noise**: Standing near machines (beeping props) grants focus (crit chance).
* **Second Opinion**: First death each ward rewinds 5 seconds.
* **Chart Fragment**: Collect 3 to unlock a hidden diagnosis ending.

## Resources & Meters

* **Health (❤️)**: Standard HP; medkits and vending machines restore.
* **Insight (🧠)**: Spent to **shift layers**; recharges via REM Thief, blue candles, dream caches.
* **Audit Timer (⏳)**: Triggers on boss spawn and at scripted events.
* **Stress (📈)**: Builds during alarms; increases enemy aggression but boosts crit chance.

## Enemies — “Manifestations”

* **Rumination**: Orbiting thought‑mites; re‑aggro when ignored.
* **Panic**: Sprinters that cause audio distortion on proximity.
* **Anhedonia**: Tanky, slow; drains color saturation while nearby.
* **Inner Critic**: Ranged caster that debuffs your aim.
* **Catatonia**: Dormant until you jump near it; then grabs.
* **Night Auditor** (global): Appears during collapse as an invulnerable chaser in some modes.

### Ward Bosses

* **The Administrator** (Admissions): Bureaucratic hydra; cut one head, two forms rise.
* **The Null Ward** (Radiology): Cloaks in film grain; only visible between pulses.
* **The Archivist** (Records): Hurls redacted pages; weak to Placebo. 😉

## Biomes / Wards

Admissions • ICU • Radiology • Pharmacy • Maintenance Tunnels • Sleep Lab (Awake/Asleep variants)

## Story Structure

* **Act I — Orientation**: “You’re awake.” Learn systems, acquire your first shard.
* **Act II — Intake**: Choose routes; discover your chart isn’t yours.
* **Act III — Reconciliation**: Assemble the truth; the hospital is your mind’s ledger.
* **Endings**:

  * **Discharge**: Escape before the audit.
  * **Readmission**: Fail the audit; seed mutates (harder next run).
  * **Correct Chart**: Find all Chart Fragments and confront the true name.

## Menus & Options

* **Seed Input** with save/restore
* **Daily Challenge** (America/New\_York date)
* **Accessibility**: Toggle screen shake, high‑contrast sprites, subtitles, dyslexia‑friendly font.
* **Audio**: SFX/Music sliders; white‑noise comfort track option.
* **Difficulty**: Normal / Hard / Night Shift (audit starts earlier, more stress events)

## Run Codes

End‑of‑run screen shows a **Base64 “Discharge Summary”** with seed, ward order, boss, traits, meters, time, result. Shareable only (no import).

## Tech

* **Engine**: Phaser `3.60.x` (Arcade Physics) via CDN.
* **Language**: ES modules; single‑page bootstrap with modular scene files.
* **Storage Keys**: `use_meta_v01`, `use_last_seed_v01`, `use_options_v01`.
* **Sprites/UI**: Minimalist shapes + emoji fallbacks for clarity on first pass.

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

## Roadmap

* v0.1: Core loop, two layers, 12 traits, 6 weapons, 12 enemies, 2 bosses, one discharge ending.
* v0.2: Daily Challenge, chart fragments, archivist boss, stress/audit tuning.
* v0.3: Meta unlocks (new ward: **Sleep Lab**), “Night Shift” difficulty, Placebo synergies.
* v0.4: Assist options, high‑contrast pack, controller support.

## Troubleshooting

* Clipboard (copy seed/run code) may require HTTPS or `http://localhost`.
* If audio is muted on first interaction, click once inside the game to unlock audio context (browser policy).
* Performance low? Disable screen shake and reduce particle budget in Options.

## License

TBD. Phaser © Photon Storm Ltd. See Phaser’s license for details.
