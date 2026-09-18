# miniRPG — Codex Development Instructions

## Project Context

miniRPG is a single-player, mobile-first, text-oriented open-world RPG web application.

The complete game design and gameplay rules are defined in:

`SPEC.md`

Always read `SPEC.md` before implementing or modifying gameplay mechanics.

`SPEC.md` is the authoritative source for game rules.

---

## General Development Principles

Keep the project:

* Simple
* Modular
* Maintainable
* Mobile-first
* Data-driven where appropriate
* Easy to test
* Easy to extend

Do not over-engineer the application.

Prefer clear and simple solutions over unnecessary abstractions.

Do not add libraries or frameworks unless they provide a clear benefit.

---

## Language

Everything in the project must be written in English:

* Source code
* Variable names
* Function names
* File names
* Game data
* UI text
* Comments
* Tests

Use clear and descriptive names.

Example:

```text
strength
agility
willpower
intelligence
charisma
long_sword
calculateMovementPoints()
resolveAttack()
```

Never use French identifiers in the source code.

---

## Game Rules

Never invent, silently modify or reinterpret gameplay rules.

If a required rule is missing or ambiguous in `SPEC.md`:

1. Do not invent a permanent rule.
2. Identify the ambiguity.
3. Ask for clarification when it blocks implementation.

When implementing a rule, follow `SPEC.md` exactly.

Keep gameplay constants explicit and easy to locate.

---

## Architecture

Game logic must be independent from the user interface.

React components must not contain core gameplay calculations.

Prefer modules similar to:

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

Examples of logic that belongs in the game engine:

* Dice rolls
* Attribute bonuses
* Initiative
* Movement
* Carrying capacity
* Attack resolution
* Damage
* Inventory rules
* Quest state
* Character progression

React should consume game state and game-engine results rather than reproduce those calculations.

---

## Game State

Do not store essential game state only inside React components.

Game state must be serializable because the player can save the game at any time.

Avoid storing functions, DOM objects or other non-serializable values inside persistent game state.

The architecture must eventually support restoring a saved game exactly.

---

## Data-Driven Content

Whenever practical, define game content as data rather than hard-coded logic.

This includes:

* Weapons
* Armor
* Items
* Enemies
* NPCs
* Spells
* Locations
* Quests
* Encounters

For example, `long_sword` should be an item definition consumed by the combat engine rather than a special case inside `resolveAttack()`.

Use stable internal IDs.

Example:

```text
long_sword
```

Display names can remain separate:

```text
Long Sword
```

---

## Combat Engine

The combat engine is a core independent module.

It must not depend on React.

Combat functions should be small, explicit and testable.

Examples:

```text
rollInitiative()
calculateMovementPoints()
calculateCarryPenalty()
calculateAttackRoll()
calculateDamage()
resolveAttack()
moveCombatant()
```

Combat results should expose enough information for the UI to explain what happened.

For example, an attack result may include:

```text
naturalRolls
rawRollTotal
attackBonus
finalAttackRoll
targetArmorClass
hit
hitQuality
baseDamage
damageBonus
finalDamage
```

Do not hide important combat calculations inside UI code.

---

## Randomness

Random game mechanics must be implemented through centralized utilities.

Do not scatter calls to `Math.random()` throughout the codebase.

Prefer utilities such as:

```text
rollDie(sides)
rollD20()
randomInteger(min, max)
```

Design random-dependent functions so randomness can be controlled or injected during automated tests.

This is important for deterministic combat tests.

---

## Coordinates

Combat grid coordinates are zero-based.

For a 20x20 grid:

```text
x = 0..19
y = 0..19
```

Player starting position:

```text
(10, 0)
```

Enemy starting line:

```text
y = 19
```

Never introduce a second coordinate convention.

---

## Numeric Calculations

Do not silently round numeric values.

Some rules use decimal values, including:

* Diagonal movement: 1.4 movement points
* Damage multiplier: 1.5

If a calculation requires integer conversion and `SPEC.md` does not define the rounding rule, flag the ambiguity rather than inventing one.

---

## Graphics and UI Architecture

miniRPG is a graphical 2D top-down RPG with text-driven interactions.

The main game world and tactical combat are rendered graphically.

Use HTML5 Canvas for the main graphical game area.

React manages the surrounding application UI.

Do not implement the game map as hundreds of individual React DOM elements.

Keep these responsibilities separate:

Game Engine:
- Rules
- Movement
- Combat
- World state
- Character state
- NPC state
- Quests
- Inventory

2D Renderer:
- Tiles
- Sprites
- Grid
- Positions
- Selection
- Movement previews
- Graphical effects

React UI:
- HUD
- Dialogue
- Menus
- Character screen
- Inventory
- Equipment
- Journal
- Save/load

The renderer must never become the authoritative source of gameplay state.

Player input follows this flow:

Input -> Game Engine -> Updated Game State -> Renderer

Never:

Input -> Renderer directly changes game rules or authoritative state.

## Mobile-First UI

The game is primarily intended to be played on a smartphone.

Design for portrait smartphone screens first.

Requirements:

- Touch-friendly controls.
- No hover-dependent functionality.
- No required horizontal scrolling.
- Readable dialogue text.
- Large enough touch targets.
- Responsive game canvas.
- Inventory and journal usable on small screens.
- Combat grid must support touch selection.

Desktop layouts may use additional available space without changing gameplay rules.

## Graphical Assets

Use replaceable graphical assets.

During development, simple placeholder graphics are acceptable and preferred over blocking gameplay development.

Do not embed gameplay rules into graphical assets.

Keep tiles, sprites and other graphics organized separately from game logic.

The architecture must allow placeholder assets to be replaced by final pixel-art assets later.

---

## Testing

Gameplay rules must have automated tests.

Tests are especially important for:

* Attribute bonuses
* Character creation
* HP calculations
* Carrying capacity
* Movement penalties
* Initiative
* Grid boundaries
* Diagonal movement
* Attack rolls
* Exploding natural 20
* Armor Class
* Damage
* Very Good Roll detection
* Critical Roll detection

Whenever a gameplay bug is fixed, add or update a test when practical to prevent regression.

Prefer deterministic tests.

---

## Scope Control

Work incrementally.

Do not implement future systems simply because they are mentioned in `SPEC.md`.

Only implement the feature currently requested.

For example, when asked to implement Character Creation:

Do not also implement merchants, quests, magic, world generation or the complete combat system.

Avoid speculative code for features that do not yet exist.

---

## Dependencies

Before adding a new dependency:

1. Check whether the existing stack or standard JavaScript/TypeScript can reasonably solve the problem.
2. Prefer small, established dependencies.
3. Avoid dependencies for trivial functionality.
4. Explain significant new dependencies before introducing them.

---

## Code Quality

Prefer:

* Small functions
* Explicit parameters
* Clear return values
* Minimal side effects
* Reusable game-engine functions
* Clear separation of responsibilities

Avoid:

* Giant components
* Giant game-engine functions
* Duplicate game rules
* Magic numbers scattered throughout the code
* Premature abstractions
* Hidden global state

Comments should explain why something exists, not repeat what obvious code does.

---

## Changes

Before making a substantial change:

1. Read the relevant section of `SPEC.md`.
2. Inspect the existing implementation.
3. Preserve existing working behavior unless the requested change intentionally modifies it.
4. Identify which files need to change.
5. Implement the smallest coherent change.
6. Run relevant tests.
7. Report what changed and whether tests passed.

Do not rewrite unrelated working code.

---

## Specification Maintenance

When a requested feature introduces a new permanent gameplay rule that is not yet documented in `SPEC.md`, point this out.

The specification should remain synchronized with the implemented game rules.

Do not silently allow implementation and specification to diverge.

---

## First Development Objective

The initial implementation sequence defined by `SPEC.md` must be respected.

Start with:

1. Project foundation.
2. Character Creation.
3. Character model.
4. Starting attributes.
5. Starting HP.
6. Starting gold.
7. Starting `long_sword`.
8. Automated tests for character creation.

Then implement the Combat Engine foundation incrementally.

Do not attempt to build the complete game in the first iteration.

---

## Definition of Done

A requested feature is complete when:

* It follows `SPEC.md`.
* Core logic is separated from UI code.
* Relevant automated tests exist and pass.
* The feature works on a mobile-sized viewport.
* Existing tests still pass.
* No unrelated functionality was unnecessarily changed.
* No undocumented gameplay rule was invented.
