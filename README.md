# miniRPG

A mobile-first React and TypeScript RPG prototype. Start a new game, name your
character, explore the outdoor map, and visit Greenhaven to speak with its residents
and record a first clue in your Journal. A marked outdoor Wolf encounter now opens
a full turn-based tactical battle. Graphics are original pixel-art placeholders.

## Getting started

Use Node.js 24 LTS and npm. Node.js 22.12+ within version 22, and Node.js 26+
are also supported by the tooling.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To test on a phone on the same network, run
`npm run dev -- --host 0.0.0.0` and open the printed network URL.

## Tests

```sh
npm test
```

Use `npm run test:watch` for watch mode. Vitest runs the domain tests without a browser.
Coverage includes character creation, attribute bonuses, collision, movement, map
integrity, camera boundaries, keyboard mappings, serialization, and store updates.
Town tests cover entry/exit positions, NPC collision and interaction range, dialogue
movement locking, clue discovery, duplicate prevention and content references.
Combat tests cover initiative/ties, carrying thresholds, exact movement costs, attack
attributes, exploding rolls, hit-quality boundaries, provisional damage rules, Wolf AI,
victory/defeat, exploration restoration and Canvas selection coordinates.

## Production build

```sh
npm run build
npm run preview
```

The build runs TypeScript checking and outputs the production application to `dist/`.
The preview command serves that build locally. Use `npm ci` instead of `npm install`
for reproducible installation from the lockfile.

## Architecture

- `src/game/character/`: serializable character model, creation defaults, name validation,
  and the independent attribute bonus function.
- `src/game/items/`: item definitions keyed by stable IDs; equipment stores those IDs.
- `src/game/gameStore.ts`: a small React-independent store created at application startup.
  Serializable snapshots contain data only; subscriptions and actions stay outside them.
- `src/game/world/`: fixed map data, tile coordinates, terrain rules and movement.
- `src/game/locations/`: stable world/town IDs, fixed town map and portal destinations.
- `src/game/npcs/`: stationary NPC definitions, positions, dialogue references and appearances.
- `src/game/interaction/`: available actions based on location and tile range.
- `src/game/dialogue/`: linear dialogue content, progression and completion effects.
- `src/game/journal/`: clue definitions and serializable, deduplicated discoveries.
- `src/game/combat/`: serializable combat state, initiative, movement, attack resolution,
  turns, the fixed encounter, and simple Wolf AI.
- `src/game/enemies/`: data-driven enemy definitions; currently only the Wolf.
- `src/game/random/`: centralized randomness, with injectable dice for deterministic tests.
- `src/ui/combat/`: tactical controls, Canvas wrapper and logs derived from combat results.
- `src/renderer/`: pixel-art placeholders, following camera and Canvas drawing code,
  with no gameplay rules or authoritative state.
- `src/ui/`: name form, HUD, keyboard input, mobile controls, Canvas wrapper,
  dialogue overlay and Journal screen. Only menu visibility is local React state.
- `src/App.tsx`: screen flow and subscription to game state.
- `src/styles.css`: mobile-first layout and touch-friendly controls.

React and React DOM are the only runtime dependencies. Vite, its React plugin,
TypeScript, type definitions, and Vitest provide development and build tooling.

## Scope and decisions

The repository's specification is named `SPECS.md`, although `AGENTS.md` refers to
`SPEC.md`. This implementation follows `SPECS.md`; sections 29–31 record the
implemented milestones and explicitly identify provisional combat decisions.

Names have surrounding whitespace trimmed; empty and whitespace-only names are rejected.
No extra name length or character restrictions are imposed. Starting equipment is a
list containing `long_sword`; the inventory can move it between the equipped weapon and backpack.

## Exploring the test map

- Arrow keys move north, south, east and west. Q/E/Z/C move north-west,
  north-east, south-west and south-east. Number-pad digits also work with Num Lock on.
- Tap or click one of the eight directional buttons to take one step. Each button
  is at least 48px square. Keyboard repeat supports continuous tile-by-tile walking.
- Walk on grass and roads. Trees, water, houses and rocks are obstacles.
- Diagonal moves require both adjacent orthogonal tiles to be walkable as well
  as the destination. The player cannot cut across obstacle corners.
- The map is hand-authored as terrain symbols, converted to serializable tile ID rows.
  `tiles[y][x]` uses a southern origin: x grows east and y grows north. The renderer
  alone converts to Canvas coordinates, where screen y grows downward.
- The test spawn is `(14, 14)`. The camera follows the player and clamps to map edges.
  Tiles use 32 CSS pixels on screens narrower than 760px and 48px on desktop; only visible tiles are drawn. Original 16x16 drawings
  are cached as sprites, enlarged without smoothing, and rasterized for devicePixelRatio.
- Exploration uses no movement points or time costs. Only the fixed Wolf encounter is implemented.

## Visiting Greenhaven

1. From the starting tile, walk five tiles north along the road to the labeled gate
   at `(14, 19)`. Stand on the gate and press **F**, or tap **Interact**, to enter.
2. Arrive in Greenhaven at `(8, 2)`. Speak to Mara near the gate, Alden in the square,
   or Nell to the north-east. Stand beside an NPC (including diagonally) and use Interact.
3. Use **Next** to read each line, then **Close dialogue** on the final line.
   Completing Alden's conversation records the strange-lights clue once.
4. Open **Journal** to read discovered clues and their sources. Use **Close Journal**
   or Escape to return to the map.
5. Stand on Greenhaven's southern gate at `(8, 1)` and use Interact to return to
   the outdoor approach tile `(14, 18)`. Arrival never automatically activates a gate.

F preserves the existing E diagonal movement binding. If several targets are available,
each gets a labeled Interact button; F uses the first displayed action. Interaction key
repeat is ignored to avoid accidental repeated activation. Movement keys retain repeat.
NPC tiles also block diagonal corner cutting. Moving near an NPC does not start dialogue.
Movement is locked by the game store during dialogue, and the clue is awarded only when
the final line is closed. Journal content persists through map transitions.

On narrow screens the directional pad and Interact buttons overlay the lower map corners.
They disappear during dialogue, leaving readable text and a single advance/close button.
The Journal uses a native modal dialog; movement input is suspended while it is open.
Messages appear below the Canvas on mobile, or beside it with character stats on desktop. NPCs and gates are rendered from domain
data supplied to the renderer, with no behavior or collision logic in Canvas code.

## Fighting the Wolf

1. From the outdoor starting position `(14, 14)`, move **four tiles east** to the
   marked Wolf at `(18, 14)`. From Greenhaven's exit, head south to the crossroads first.
   Stepping onto that tile starts the fixed encounter; it is not a random encounter.
2. Combat uses a 20x20 grid. You start at `(10, 0)` and the Wolf at `(10, 19)`.
   Initiative is d20 + Agility bonus, with higher Agility breaking ties and ascending
   stable combatant ID breaking a remaining tie.
3. On your turn, tap an adjacent highlighted tile to preview its cost and confirm the
   move, or use the directional pad/keyboard. Orthogonal steps cost 1 MP, diagonals 1.4.
   The active combatant is outlined in gold. Occupied/out-of-bounds tiles are blocked.
4. Use **Inspect battlefield** to find either combatant or pan the camera. The view
   keeps readable 32px mobile / 48px desktop tiles; camera controls never change combatant positions.
5. **Attack Wolf** becomes available in melee range, including diagonal adjacency.
   One attack (hit or miss) ends your turn. **End Turn** skips the attack. The Wolf
   moves toward you, bites if adjacent, and ends its turn automatically.
6. On victory, choose **Return to exploration**. Remaining HP persists, with no rewards.
   The encounter stays cleared for this game, so returning does not immediately restart it.
   At 0 player HP, **Game Over** is final for the current session; reload to start over.

Attack rolls use strict `finalAttackRoll > AC`; equality misses. Natural attack 20s
continue exploding until a non-20 roll occurs. Structured results preserve all dice,
bonuses, damage and hit quality for the combat log. The engine never reads log text.
The UI briefly schedules an enemy turn; the store and engine enforce turn ownership.

### Provisional combat decisions requiring confirmation

These are centralized in `src/game/combat/rules.ts` and are not final gameplay rules:

- Fractional damage uses `Math.floor()`.
- Critical damage temporarily uses the Very Good Roll multiplier, x1.5.
- Successful attacks have a minimum final damage of 1, after bonuses and quality.
- As explicitly selected, the starting load is treated as unencumbered. Item and gold
  weights remain undefined. The engine applies all four carrying tiers to a supplied load;
  this milestone supplies an unencumbered load rather than inventing item weights.

Movement uses integer hundredths for accumulated costs and computes remaining MP
from the turn budget; this avoids floating-point drift without rounding movement.

Game state is held outside React and can be serialized. Reloading the page starts over.
Multiple enemies, rewards, loot, XP, progression, armor equipment, ranged attacks,
quests, shops, resting, interiors, branching dialogue, magic,
generation, advanced AI, save/load and final artwork are not implemented.

## Inventory and combat feedback

Open **Inventory** while exploring to inspect the starting Long Sword, move it into
the backpack with **Unequip**, or **Equip** it again. These transfers preserve the
item and gold and are disabled during dialogue/combat. An unequipped sword cannot
be used to attack; no unarmed damage rule has been invented.

Capacity is **Strength ? 5 kg** (50 kg initially). Item and gold weights remain
undefined under the prior instruction, and the starting load remains provisionally
unencumbered. The maximum capacity is separate from the existing combat movement penalties,
which remain unchanged. Actual weight enforcement still needs item and gold weights. No pickup, drop, loot, buying or selling is introduced.

Combat displays the latest hit damage or miss over the battlefield and keeps recent
messages in the dedicated panel (newest first). Open browser developer tools ?
**Console** and filter `[Combat]` to inspect every initiative and attack result,
including chained d20s, modifiers, AC, damage die, quality multiplier, rounding and
final damage. Invalid actions do not generate rolls.

Short synthesized sounds distinguish player/enemy hits and misses. Sound activates
after a click, tap or keypress when browser audio is available; use **Sound on/off**
to mute. No audio downloads or new dependencies are required.
