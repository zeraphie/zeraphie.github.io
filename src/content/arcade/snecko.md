---
title: Snecko
icon: worm
logo: snecko
description: "A roguelike version of the classic Snake game, featuring procedural generation, boss fights and different game modes"
date: 2026-08-31
game: https://zeraphie.github.io/snecko/
---

Many years ago, I tested myself to make a Snake game in JavaScript. This [codepen](https://codepen.io/chrysokitty/pen/wMGGyB) was the result and there were a bunch of bad practices that I'd used in it, woops. I've been playing a lot of [Slay the Spire 2](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/), and I wanted to make a much better snake game, but with a twist. So I made [Snecko](https://zeraphie.github.io/snecko/). At the beginning it was just a terminal based game, but I made it in a way that allowed me to play it in the browser as well, and you can still play it in either way.

Over time it became a pretty large project, with different game modes, boss fights, and even a mini souls-like boss fight. It became my testing and experimentation ground for random ideas and interests I wanted to explore. I see this game in two different ways, a technical exploration of cool concepts, and a fun game to play.

## What is it?
Snecko is primarily a snake based roguelike, where the core loop is to avoid walls, collect food, and make your way through "Acts". At the end of each Act, the player can choose an ability, which falls under 3 main categories: consumables, passives, and bites.

### Upgrades
- **Consumables:** Used upon a special consumable key, consuming one use.
- **Passives:** These are abilities that stay active while counting down on every food bite.
- **Bites:** These are abilities that automatically activate when an in game event happens, consuming one usage.

### Mutations
There is also a 25% chance that a player is offered an additional choice (but guaranteed every three Acts), which is known as a Mutation. This fundamentally changes the game mode between one of the other three Mutations. The 4 Mutations are:

- **Crystalline:** Crystals are scattered throughout the map, periodically spawning, growing, and decaying.
- **Wildlands:** Terrain is generated for the Act, with rivers spawning, surging and changing.
- **Catacombs:** A maze is generated for the Act, with walls moving and changing.
- **Brood:** The player places their brood on the map, and Sir Reginald Caw tries to attack them. The player has the ability to shield, and place mines that stun Reginald, but this is a race against time, at least one member of the Brood must survive the end of the Act.

### Boss fights
Every 10 food eaten, a secondary boss food will spawn, which when eaten will trigger a Boss fight. Skipping bosses is possible, but the player must eat 10 food before a new boss food spawns. The boss fight operates under different rules, falling under 3 categories:

- **Bullet hell**: The snake transforms into an airplane, with a boss that is constantly firing at the player in differing patterns. Destroy the body cells of the boss, and then hit its weak point to defeat it.
- **Survival**: The boss is an invincible creature that is chasing the player throughout the area, the player must escape them for the duration of the timer to clear the boss.
- **Soulslike**: The snake is given a knife, and gets tired, the boss will constantly chase down the player with a variety of attacks, and the player must dodge, parry or strafe, while damaging the boss.

Boss fights also do not benefit from the normal upgrade system, and instead have a new system called Contraband. Contraband are boss fight specific upgrades, with some upgrades even specific to certain boss types. When a boss is defeated, it progresses the food counter by 3, and a choice of Contraband is offered to the player.

### Easter eggs
I **love** [fox](https://www.youtube.com/watch?v=xwtaekgVt9Q)es, and I'm aware that sometimes foxes hunt snakes. I'm also someone that loves easter eggs or secrets, so I added a fox upgrade, which you can also uniquely trigger one time per act (even if you don't have it), and also have it damage a boss if you have the upgrade. It's a consumable and when triggered pauses the game for a fox to come into the screen and pounce on the food or the boss for you. In order to do it I also made my own animation sprite system, declaring a few frames in something similar to a sprite sheet but expressed with characters, for example, this is the frame for the pounce:

[!code ref:https://github.com/zeraphie/snecko/blob/main/assets/animations/fox.canvas.animation#L46]
```
pounce
....SS..........
...SPPS.........
..SPPPPS.KKKK...
...KKKKK.KOOOK..
..KOYOOKKKOYOK..
..KOOOOOOOOOOK..
.KOWWEEEEEEWWOK.
.KOWWEEEEEEWWOK.
KOOOWWWWWWWWOOOK
KOOOOOOOOOOOOOOK
KOWWOOOOOOOOWWOK
KOWWOOOOOOOOWOOK
.KOOK......KOOK.
..KK........KK..
................
................
```

It's pretty rough around the edges, but can be changed at any point to make it look better, and was also the method by which I added Sir Reginald Caw into the Brood mutation.

## [!log] Designing for bitwise math
I've previously dabbled in some games, and traditionally there's a way of handling hit detection which is fine, but I wanted to chase after something that was more efficient. As someone who's been a JavaScript & TypeScript developer for quite some time, I've used bitwise operators for a number of niche cases, and I thought it could be an interesting way of having an [O(1)](https://en.wikipedia.org/wiki/Big_O_notation) hit detection system.

### The bitwise grid
The concept started with understanding what circumstances favoured bitwise operations, and how I can base a game off of them. With a snake game, 1 part of the snake can fill a cell on a grid, and food is also a cell, and walls are also a cell. So I researched into bitwise math and settled on a 31x31 grid that allowed me to represent the grid using 31 integers, or 124 bytes. This was perfect for the math and allowed me to center on an odd number of cells. JavaScript bitwise operators coerce to a signed 32-bit, where bit 31 is the sign bit and `1 << 31` comes out as `-2147483648`, which is avoided by using 31 as the width of the grid.

> [!quote]
> _“31 bits are safe for 32-bit signed integers”_

There are quite a few different things that a cell can be in the game, so each cell is represented by three bits, in three separate masks: wall, snake, and reserved - but also includes a terrain byte. A simple example of why this was wanted, is in the Brood mutation, a brood's cell can act as a wall, but be rendered differently depending on if the brood member is alive, dead, or shielded.

One counterpoint is that food isn't really a mask, there's only ever one food (or two if there's a boss food), so storing a whole bitplane per grid for food would be a waste, it's just two integers instead.

[!code ref:https://github.com/zeraphie/snecko/blob/main/src/core/grid/layers.js#L29]
```typescript
/**
 * Tests whether a cell is set in the given layer.
 *
 * @param {"wall"|"snake"|"reserved"} layer
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function isCellSet(layer, x, y) {
  const masks = this._getMask(layer);
  const chunk = (x / CHUNK_BITS) | 0;
  const bit = x - chunk * CHUNK_BITS;
  const idx = y * this.chunksPerRow + chunk;
  return (masks[idx] & (1 << bit)) !== 0;
}
```

This means that in order to represent walls on a certain row, it's as simple as setting the corresponding bit in the mask, i.e. if I want walls at cells 0, 1, 2, 7 & 30 in a row, the mask is `1073741959` → `1000000000000000000000010000111` resulting in

```
███    █                      █
```

### Moving the snake
Normally, movement moves every cell of the snake, resulting in O(n), however, because the snake is represented by two fixed `Int16Array(4096)` buffers and two indices, meaning that nothing is actually "moving", so a 400 cell snake costs the same as a 3 cell snake.

[!code ref:https://github.com/zeraphie/snecko/blob/main/src/core/snake/movement.js#L130]
```typescript
this.headIndex = (this.headIndex + 1) % MAX_CELLS;
this.snakeX[this.headIndex] = nx;
this.snakeY[this.headIndex] = ny;
grid.setCell("snake", nx, ny);
```

However, that doesn't work for the tail, since moving into the snake's own tail would result in a collision, so an exception is needed.

[!code ref:https://github.com/zeraphie/snecko/blob/main/src/core/snake/movement.js#L119]
```typescript
const tailWillVacate = !this.growing && nx === tailX && ny === tailY;

if (grid.isSnakeCell(nx, ny) && !tailWillVacate) {
  this.alive = false;
  this.deathCause = DEATH_SELF;
  return "self";
}
```

> [!quote]
> _“Snake movement is O(1), hit detection is a lookup”_

One player also brought up the fact that quick zigzags were incredibly difficult to make happen since they needed pretty tight timing, so I added a direction queue, so that zigzagging behaviour would be more predictable, and doing a U turn would be more consistent.
