# miniRPG — Game Specification

## 1. Game Overview

miniRPG is a single-player, text-oriented open-world RPG designed primarily as a mobile web application.

The player controls a character exploring a kingdom dominated by the tyrant Ghor.

The main objective is to defeat Ghor and free the kingdom.

Ghor cannot be defeated by ordinary equipment. The player must find four Sacred Jewels and combine each one with a corresponding legendary artifact:

* Sword
* Armor
* Shield
* Helm

Only when the four artifacts have been empowered by their Sacred Jewels will the player possess enough power to confront Ghor.

The world is completely open. The player is not forced to follow the main quest in a predefined order.

---

# 2. Core Principles

miniRPG must follow these principles:

* Single-player only.
* Mobile-first web application.
* Primarily text-based interface.
* Completely open world.
* Turn-based combat.
* Tactical combat using a grid.
* Character progression through attributes, equipment, spells and discoveries.
* No mandatory character classes.
* The player may save the game at any time.
* NPCs can provide information, rumors, clues and quests.
* Important information discovered by the player is stored automatically or manually in a Journal.
* The Journal contains both quests and clues.
* Exploration should be possible without necessarily following quests.

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

Strength determines how much weight the character can carry without movement penalties.

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
