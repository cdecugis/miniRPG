# miniRPG — Game Specification

## 1. Game Overview

miniRPG is a single-player, open-world 2D RPG designed primarily as a mobile web application.

The game combines a graphical top-down world inspired by classic tile-based RPGs with text-driven dialogues, quests, clues and narrative events.

Exploration and tactical combat are displayed graphically using a top-down tile/grid view.

Text remains an important part of the game for:
- NPC conversations
- Narrative events
- Descriptions
- Quests
- Clues
- Journal entries
- Combat information

The player controls a character exploring a kingdom dominated by the tyrant Ghor.

The main objective is to defeat Ghor and free the kingdom.

Ghor cannot be defeated by ordinary equipment. The player must find four Sacred Jewels and combine each one with a corresponding legendary artifact:

- Sword
- Armor
- Shield
- Helm

Only when the four artifacts have been empowered by their Sacred Jewels will the player possess enough power to confront Ghor.

The world is completely open. The player is not forced to follow the main quest in a predefined order.

---

## 2. Core Principles

miniRPG must follow these principles:

- Single-player only.
- Mobile-first web application.
- Graphical 2D top-down world.
- Tile/grid-based movement.
- Pixel-art visual direction.
- Text-driven dialogues and narrative.
- Completely open world.
- Turn-based tactical combat.
- Character progression through attributes, equipment, spells and discoveries.
- No mandatory character classes.
- The player may save the game at any time.
- NPCs can provide information, rumors, clues and quests.
- Important information can be stored in the Journal.
- Exploration should be possible without necessarily following quests.

---

# 3. World

The game starts in a main city.

Cities and settlements provide safe or relatively safe locations where the player can:

* Rest.
* Recover.
* Buy items.
* Sell items.
* Talk to NPCs.
* Obtain quests.
* Obtain clues and rumors.
* Learn information about the world.

Outside settlements, the player explores an open world containing locations such as:

* Roads
* Plains
* Forests
* Mountains
* Villages
* Cities
* Castles
* Ruins
* Caves
* Dungeons
* Other special locations

Travel can result in encounters with enemies such as:

* Animals
* Monsters
* Brigands
* Soldiers
* Magical creatures
* Other hostile characters

Enemy difficulty depends on the region and encounter.

The world itself must not artificially prevent the player from entering dangerous regions.

---

# 4. Journal

The player has a Journal.

The Journal contains at least two categories:

## Quests

Tracks known quests, objectives and relevant quest information.

## Clues

Stores information discovered during exploration or conversations.

Examples:

* Rumors about a hidden cave.
* Information about one of the Sacred Jewels.
* A password mentioned by an NPC.
* Information about a character.
* The location of a hidden passage.
* Information required to solve a future problem.

A clue does not necessarily correspond to an active quest.

This allows the player to investigate and discover solutions naturally in the open world.

---

# 5. Character Creation

Character creation is the first module and the first screen of a new game.

For the initial version, character creation must remain deliberately simple.

The player only enters:

* Character name

The game then creates the character with the default attributes.

## Starting attributes

Every attribute starts at:

`10 / 20`

Attributes:

* `strength`
* `agility`
* `willpower`
* `intelligence`
* `charisma`

Initial character:

```text
strength     = 10
agility      = 10
willpower    = 10
intelligence = 10
charisma     = 10
```

The maximum normal attribute value is currently 20.

---

# 6. Attribute Bonuses

Every attribute has a bonus.

The bonus is calculated relative to 10:

```text
attributeBonus = attributeValue - 10
```

Examples:

```text
8  -> -2
10 ->  0
11 -> +1
13 -> +3
20 -> +10
```

These bonuses are used directly by the different game systems.

---

# 7. Strength

Strength represents physical power.

Strength affects:

* Melee attack rolls.
* Damage with strength-based weapons.
* Some ranged weapons requiring physical strength, especially bows.
* Hit Points.
* Carrying capacity.
* Some physical interactions and challenges.

## Hit Points

At character creation:

```text
HP = 10
```

Since the starting Strength is 10, the character therefore starts with 10 HP.

Whenever the character gains a level:

```text
HP gained = current strength
```

Example:

A character with Strength 13 gains 13 additional maximum HP when gaining a level.

---

# 8. Agility

Agility represents speed, coordination and precision.

Agility affects:

* Initiative.
* Ranged attacks.
* Some weapon attack rolls.
* Some weapon damage rolls.
* Movement during tactical combat.
* Potential future dodge-related mechanics.

Some weapons can depend on multiple attributes.

For example, bows can require both Agility for accuracy and Strength to use effectively.

---

# 9. Intelligence

Intelligence represents knowledge and magical understanding.

Intelligence affects:

* Learning spells.
* Understanding magical knowledge.
* Using some magical abilities.
* Solving some intellectual challenges.

Spell resistance is primarily handled by Willpower rather than Intelligence.

---

# 10. Willpower

Willpower represents mental resistance, determination and self-control.

Willpower affects:

* Resistance to spells.
* Resistance to magical effects.
* Resistance to some mental effects.
* Special trials and challenges requiring determination.

Some events or locations may require a Willpower check or a minimum Willpower value.

---

# 11. Charisma

Charisma represents persuasion, social ability and presence.

Charisma affects:

* Merchant prices.
* Persuading NPCs.
* Negotiations.
* Some dialogue options.
* Some social challenges.

A high Charisma may allow the player to solve situations without combat.

---

# 12. Starting Character

A newly created character starts with:

```text
level = 1

strength = 10
agility = 10
willpower = 10
intelligence = 10
charisma = 10

maxHP = 10
currentHP = 10

gold = 100
```

Starting equipment:

```text
long_sword
```

The character therefore begins the game with:

* 100 Gold Pieces (`gold`)
* One Long Sword (`long_sword`)

---

# 13. Items and Equipment

Items must be defined independently from character data.

Each weapon should be data-driven rather than hard-coded inside the combat engine.

Example:

```text
id: long_sword
name: Long Sword
damageMin: 1
damageMax: 8
```

The Long Sword deals:

```text
1-8 damage
```

This is equivalent to rolling:

```text
1d8
```

Weapons will later define which attribute or attributes affect:

* Attack roll.
* Damage roll.
* Requirements.
* Other special properties.

---

# 14. Carrying Capacity

Maximum inventory capacity is `strength * 5 kg`, separate from the movement penalties below.
At Strength 10 the maximum is 50 kg, but loads above 40 kg still prevent tactical movement.

Strength also determines how much weight the character can carry without movement penalties.

Base carrying capacity:

```text
baseCarryWeight = strength * 2 kg
```

Movement penalties are:

```text
weight <= strength * 2:
    no movement penalty

weight > strength * 2
and weight <= strength * 3:
    -25% movement

weight > strength * 3
and weight <= strength * 4:
    -50% movement

weight > strength * 4:
    -100% movement
```

At more than `strength * 4 kg`, the character cannot move.

Example with Strength 10:

```text
0-20 kg     -> 100% movement
>20-30 kg   -> 75% movement
>30-40 kg   -> 50% movement
>40 kg      -> 0% movement
```

Inventory weight therefore has a direct tactical impact during combat.

---

# Graphical Interface

miniRPG uses a top-down 2D graphical game view inspired by classic tile-based RPGs.

The visual direction should evoke classic games such as early Ultima-style RPGs while remaining clean and readable on modern smartphones.

The game must not reproduce the graphical limitations of historical hardware.

## Main Game View

The main screen contains:

1. A graphical game area.
2. A compact status/HUD area.
3. A dialogue and information area.
4. Access to important game functions.

Typical functions include:

- Character
- Inventory
- Equipment
- Journal
- Save

The graphical area occupies most of the available screen.

## Dialogue

NPC conversations and narrative events appear in a dialogue box associated with the graphical game view.

The dialogue box may appear below the game view or as an overlay depending on available screen space.

On mobile, dialogue must remain readable without hiding essential interaction controls.

Dialogue may provide selectable responses when required.

## Exploration Rendering

World exploration is displayed using a top-down tile-based view.

Tiles may represent:

- Grass
- Roads
- Forest
- Water
- Mountains
- Buildings
- Walls
- Doors
- Cave entrances
- Dungeon terrain
- Other world features

Characters, NPCs, creatures and objects are displayed as sprites positioned on the tile map.

The world is larger than the visible screen.

The renderer displays the relevant area around the player.

## Combat Rendering

Combat uses the same general top-down graphical philosophy as exploration.

Standard combat takes place on the 20x20 tactical grid defined by the combat rules.

The graphical interface must clearly show:

- Player position
- Enemy positions
- Terrain
- Obstacles
- Movement possibilities
- Selected targets
- Area-of-effect spell zones
- Relevant combat feedback

The combat interface must support touch interaction.

Selecting a destination should allow the game to display whether the destination is reachable and the movement cost before executing the move.

## Rendering Technology

The game area should use HTML5 Canvas with a dedicated 2D renderer.

React manages the application interface surrounding the game view.

React is responsible for elements such as:

- Menus
- HUD
- Dialogue boxes
- Inventory
- Character screen
- Journal
- Save/load interface

The Canvas renderer is responsible for drawing:

- Tiles
- Sprites
- Combat grid
- Terrain
- Selection indicators
- Movement indicators
- Graphical effects

The renderer must never contain authoritative gameplay rules.

It receives game state and renders it.

Game rules remain inside the game engine.

## Graphics and Assets

Graphics should use a coherent pixel-art style.

Initial development may use simple placeholder tiles and sprites.

Gameplay development must not depend on having final artwork.

Graphical assets should be replaceable without modifying game-engine rules.

Assets should use stable identifiers and organized directories.

# 15. Combat System

Combat is turn-based and tactical.

Combat takes place on a square grid.

The combat engine must remain independent from the visual interface.

The UI displays the current combat state, but game rules are calculated by the combat engine.

---

# 16. Combat Grid

Every standard combat uses a:

```text
20 x 20
```

grid.

Coordinates are zero-based:

```text
x = 0..19
y = 0..19
```

The bottom of the battlefield is:

```text
y = 0
```

The top is:

```text
y = 19
```

## Player starting position

The player starts at:

```text
(10, 0)
```

## Enemy starting positions

A single enemy starts at:

```text
(10, 19)
```

When several enemies are present, they are distributed horizontally across the enemy starting line:

```text
y = 19
```

Their positions must remain inside the 20×20 grid and must not overlap.

The exact distribution algorithm can be implemented separately.

---

# 17. Initiative

Initiative determines combat turn order.

For every combatant:

```text
initiative = d20 + agilityBonus
```

where:

```text
agilityBonus = agility - 10
```

Example:

Agility 13:

```text
d20 + 3
```

Higher initiative acts first.

A deterministic tie-breaking rule must be defined in the combat engine.

---

# 18. Movement

A character's base movement points per turn are equal to Agility.

```text
movementPoints = agility
```

Example:

```text
agility = 12
movementPoints = 12
```

Carrying penalties modify the available movement points.

## Orthogonal movement

Moving one square:

* North
* South
* East
* West

costs:

```text
1 movement point
```

## Diagonal movement

Moving one square diagonally costs:

```text
1.4 movement points
```

Example with 12 movement points:

```text
3 orthogonal squares = 3 points
5 diagonal squares   = 7 points

Total = 10
Remaining = 2
```

Movement points can therefore contain decimal values.

Movement must never exceed the combat grid boundaries.

---

# 19. Attack Roll

Attacks use a d20.

The generic attack formula is:

```text
attackRoll = d20 + weaponAttackBonus
```

`weaponAttackBonus` is based on the attribute associated with the weapon.

For example:

```text
strengthBonus = strength - 10
agilityBonus  = agility - 10
```

A melee weapon may use Strength.

A ranged weapon may use Agility.

Some weapons, such as bows, may use more complex rules involving both Strength and Agility.

These rules must be defined by the weapon rather than hard-coded globally.

---

# 20. Armor Class

Every character or creature has an Armor Class (`AC`).

Default Armor Class without armor or other bonuses:

```text
AC = 10
```

To hit an opponent:

```text
attackRoll > targetAC
```

The comparison is intentionally strict.

An attack roll equal to Armor Class does not hit.

Example:

```text
target AC = 10

attack roll 10 -> miss
attack roll 11 -> hit
```

---

# 21. Exploding Natural 20

When the natural d20 result is 20:

1. Roll another d20.
2. Add the new result to the roll.
3. Continue calculating the total attack roll.

This means attack rolls can exceed the normal d20 range.

Example:

```text
first roll  = 20
second roll = 14

raw roll total = 34
```

Attribute and weapon bonuses are then applied according to the combat engine rules.

The engine should keep both:

```text
naturalRolls
rawRollTotal
finalAttackRoll
```

so the UI can later explain what happened to the player.

---

# 22. Quality of Hit

A successful attack can become a particularly powerful hit depending on how much the attack exceeds the target's Armor Class.

Normal hit:

```text
attackRoll > AC
```

Very Good Roll:

```text
attackRoll - AC > 10
```

Damage multiplier:

```text
x1.5
```

Critical Roll:

```text
attackRoll - AC > 20
```

Critical damage rules will be implemented explicitly by the combat engine.

The `Critical Roll` state must already exist in the combat result model even if its final damage multiplier is defined later.

---

# 23. Damage

Weapons define minimum and maximum base damage.

Example Long Sword:

```text
damageMin = 1
damageMax = 8
```

Equivalent notation:

```text
1d8
```

When an attack hits:

```text
baseDamage = random integer between damageMin and damageMax
```

Then apply the relevant weapon damage attribute bonus.

For a Strength-based Long Sword:

```text
damage = baseDamage + strengthBonus
```

Example:

```text
strength = 13
strengthBonus = +3

long_sword roll = 6

damage = 6 + 3 = 9
```

Hit-quality modifiers are applied afterward.

For a Very Good Roll:

```text
damage = damage * 1.5
```

The combat engine must define and consistently apply an explicit rounding rule whenever damage becomes fractional.

---

# 24. Tactical Combat Goals

The tactical grid is not cosmetic.

Positioning must eventually matter for:

* Melee range.
* Ranged attacks.
* Spell range.
* Area-of-effect spells.
* Obstacles.
* Terrain.
* Enemy movement.
* Escape.
* Tactical positioning.

A melee character must physically move close enough to an enemy before performing a melee attack.

Spells may target:

* One combatant.
* One grid cell.
* An area of cells.

This allows future effects such as:

* Fireball.
* Walls.
* Traps.
* Poison clouds.
* Ice areas.
* Healing areas.
* Movement restrictions.

---

# 25. Saving

miniRPG is strictly single-player.

The player can save at any time.

A save must eventually contain enough state to restore the game exactly, including:

* Character.
* Attributes.
* HP.
* Level.
* Gold.
* Inventory.
* Equipment.
* Current location.
* World state.
* Quests.
* Clues.
* NPC-related state.
* Discovered locations.
* Combat state when applicable.

The architecture must therefore avoid storing essential game state only inside React components.

---

# 26. Architecture Principle

Game rules must be separated from the user interface.

React must never become the source of truth for combat rules.

Core rules belong to dedicated game-engine modules.

Initial target structure:

```text
src/
  game/
    character/
    combat/
    inventory/
    items/
    world/
    journal/
    save/
```

The combat module should expose explicit functions for operations such as:

```text
rollInitiative()
calculateMovementPoints()
calculateCarryPenalty()
calculateAttackRoll()
resolveAttack()
calculateDamage()
moveCombatant()
```

Rules should be testable without rendering the React application.

---

# 27. First Development Milestone

Do NOT attempt to implement the entire RPG immediately.

The first playable milestone is:

## Phase 1 — Character Creation

Implement:

1. New Game.
2. Character name input.
3. Creation of the five attributes at 10.
4. Starting HP = 10.
5. Starting gold = 100.
6. Starting `long_sword`.
7. Display the created character.

## Phase 2 — Combat Engine Foundation

Implement independently:

1. 20×20 combat grid.
2. Combatant positions.
3. Initiative.
4. Movement points.
5. Carrying-capacity movement penalties.
6. Orthogonal movement.
7. Diagonal movement.
8. Armor Class.
9. Attack rolls.
10. Exploding natural 20.
11. Long Sword 1d8 damage.
12. Strength attack bonus.
13. Strength damage bonus.
14. Very Good Roll detection.
15. Critical Roll detection.

Automated tests must validate the game rules before additional game systems are added.

---

# 28. Rules for Future Development

When implementing new features:

* Do not invent game mechanics that are not defined in this specification.
* Prefer data-driven definitions for items, enemies, spells and locations.
* Keep game-engine logic independent from React components.
* Keep calculations in small testable functions.
* Use stable internal IDs such as `long_sword`.
* User-facing text is written in English.
* Source-code identifiers are written in English.
* Game data is written in English.
* The architecture must remain suitable for mobile web usage.
* New mechanics should be added to this specification before or alongside their implementation.

---

# 29. Fixed Exploration Prototype

This prototype is a separate exploration milestone, requested after Character Creation.
It does not implement the combat foundation or the final starting city.

* Use a fixed, hand-authored 30x30 test map.
* Terrain includes grass, road, tree, water, house and rock.
* Grass and road are walkable. Tree, water, house and rock block movement.
* The player occupies one tile, with integer coordinates stored in serializable game state.
* Coordinates remain zero-based, with x increasing east and y increasing north.
* Movement is one tile at a time in eight directions. Destinations must be inside the map.
* Diagonal movement is blocked if either adjacent orthogonal tile is blocked.
* Exploration does not use tactical movement points or carrying penalties.
* Movement and collision belong to the game engine, independently of React and Canvas.
* A following camera stays inside the map. Resizing changes the view, not world coordinates.
* Canvas renders terrain and the player with replaceable placeholder graphics.
* Keyboard and touch controls issue movement requests to the same game engine.
* A compact HUD displays the character name, HP and gold.

The test-map layout and spawn are prototype content, not permanent starting-world rules.
Combat, enemies, NPCs, dialogue, quests, merchants, inventory management, saving,
procedural generation and final artwork remain outside this milestone.

---

# 30. Greenhaven, Dialogue and the First Clue

This milestone extends the outdoor prototype with a local town; it does not introduce
the final starting world or change combat rules.

* Locations have stable IDs, a `world` or `town` type, and their own fixed map data.
* The outdoor location is `world`. The first town is `greenhaven`, displayed as Greenhaven.
* A labeled outdoor entrance and a town exit are explicitly activated with Interact
  while the player stands on the gate tile. Transitions assign fixed approach/arrival
  positions and never activate automatically on arrival.
* The prototype entrance is `(14, 19)` outdoors; town arrival is `(8, 2)`.
  The town exit is `(8, 1)`; outdoor return is `(14, 18)`.
* NPC definitions contain stable IDs, names, locations, tile positions and dialogue references.
  Greenhaven contains Alden (an old traveler), Mara (a guard) and Nell (a villager).
* NPCs are stationary and occupy blocked tiles. The existing diagonal corner rule
  also applies to NPC occupancy.
* NPC interaction requires explicit activation from one of the eight adjacent tiles.
  Merely approaching an NPC does not trigger conversation.
* Dialogue is linear and can contain several consecutive lines. Movement and other
  interactions are blocked during active dialogue. The player advances each line,
  then closes the final line to complete the conversation.
* Completing Alden's conversation discovers `eastern_hills_strange_lights`:
  reports of strange lights beyond the eastern hills at night.
* Journal clues contain a stable ID, title, description, source NPC and discovered state.
  Repeating a conversation never duplicates a clue. Clues survive location transitions.
* The Journal currently displays only Clues, including an empty state and a close action.
* Location, position, dialogue progression and Journal discoveries remain serializable
  domain state. React displays them; Canvas only renders supplied map/entity data.
* F is the interaction key, preserving E for diagonal movement. Touch uses Interact.
  Available actions are labeled; F activates the first displayed action if several exist.
* Mobile movement/interaction controls overlay the lower map area and are hidden
  during dialogue. Dialogue text and advance/close controls remain unobstructed.

Town layout, NPC positions and transition coordinates are prototype content.
Combat, enemies, shops, buying/selling, inns/resting, interiors, quests, branching
dialogue, magic, save/load, procedural generation and final artwork remain out of scope.

---

# 31. First Tactical Wolf Encounter

This milestone implements the combat foundations from sections 14–24. Earlier
milestone scope exclusions do not exclude the combat work explicitly requested here.

* A fixed outdoor encounter at `(18, 14)` starts when entered. Exploration is paused
  and its return state is retained. Victory clears this encounter for the current game.
* The battlefield is open grass, 20x20, with the player at `(10, 0)` and Wolf at `(10, 19)`.
* Enemy `wolf`: Strength 8, Agility 12, Willpower 8, Intelligence 3, Charisma 3,
  maximum/current starting HP 6, AC 10.
* `wolf_bite`: 1d4, Agility attack bonus, Strength damage bonus, adjacent melee range.
* `long_sword`: 1d8, Strength attack and damage bonuses, adjacent melee range.
  Diagonal adjacency counts as melee range for both attacks.
* Initiative is one d20 plus Agility bonus. Higher total acts first; ties use higher
  Agility, then ascending stable combatant ID. Initiative dice do not explode.
* A turn resets movement to Agility, adjusted by the player's carrying penalty.
  The Wolf has no carrying penalty. Orthogonal movement costs 1, diagonal movement
  costs 1.4. Destinations must be adjacent, unoccupied and inside the battlefield;
  their cost cannot exceed remaining movement. Movement costs are not rounded.
* A combatant may move and attack once, or end its turn without attacking.
  A valid attack ends the turn even on a miss. Invalid actions do not spend a turn.
* Natural attack rolls of 20 repeatedly explode until a non-20 result is rolled.
  Preserve the full list, raw sum and final modified total in the attack result.
* With margin = final attack roll - target AC: margin <= 0 is `miss`, 1–10 is
  `normal`, above 10 through 20 is `very_good`, and above 20 is `critical`.
* Wolf AI attacks if adjacent; otherwise it moves toward the player using its
  movement budget, including diagonals, attacks if it reaches range, then ends its turn.
* At Wolf HP 0, combat immediately becomes victory. The player explicitly returns to
  the retained outdoor position, keeping remaining HP. No XP, gold or loot is awarded.
* At player HP 0, combat immediately becomes Game Over. No character is automatically recreated.
* Combat state, initiative, turns, movement budgets, HP and return information are serializable.
  React/Canvas display state; log text is derived from results and never drives rules.
* The tactical Canvas retains readable tiles, a visible grid, adjacent movement previews,
  and a camera that can follow either combatant or be panned to inspect the battlefield.

## Explicitly provisional decisions — not permanent rules

The user authorized these temporary implementations, pending final gameplay confirmation:

* Fractional damage is rounded down with `Math.floor()`.
* Critical damage temporarily uses x1.5, centralized independently from the final design.
* Minimum successful final damage is 1, applied after attribute/quality calculation.
* The starting load is provisionally unencumbered, as explicitly selected by the user.
  Long Sword and gold weights remain undefined; no permanent item weights are introduced.
  All carrying tiers are implemented and tested against supplied loads.

No multi-enemy encounters, random encounters, rewards, loot, XP, progression, equipment
armor, ranged attacks, magic, terrain modifiers, status effects, advanced AI or saving
are introduced by this milestone.


---

# 32. Responsive Feedback and Initial Inventory

* Phone tiles render at 32 CSS pixels, desktop tiles at 48. This changes only
  presentation, never world coordinates, movement costs or attack range.
* Mobile reserves a scrollable message panel below the map; desktop places
  messages and character statistics in a right-hand panel. Dialogue uses this area.
* Combat shows damage/miss feedback, logs every initiative/attack calculation to
  the browser console, and optionally plays synthesized player/enemy hit/miss sounds.
* Character state now includes a serializable backpack in addition to equipment.
  The initial prototype supports transferring the existing Long Sword between the
  backpack and equipped weapon outside dialogue/combat, without creating or losing it.
  A sword must be equipped to make a sword attack. Unarmed attacks are undefined.
* The user specified carrying capacity as `strength * 5 kg` (50 kg at Strength 10).

## Weight clarification pending

Item and gold weights remain undefined under the earlier explicit instruction.
The starting load remains provisionally unencumbered; unknown weights are not
represented as zero-weight item definitions. The user confirmed that Strength * 5 kg
is a separate maximum capacity; the movement tiers in section 14 remain unchanged.
Actual carried weight enforcement still awaits item and gold weights. Transfers within carried equipment/backpack do not change total load.

No loot, pickup/drop, shops, consumables, armor, unarmed combat or saving are added.
