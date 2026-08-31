---
title: Snecko
icon: worm
description: "A browser snake roguelike, how many mutations and bosses can you take down before game over?"
date: 2026-08-27
game: https://zeraphie.github.io/snecko/
---

Many years ago, I tested myself to make a Snake game in JavaScript. This [codepen](https://codepen.io/chrysokitty/pen/wMGGyB) was the result and there were a bunch of bad practices that I'd used in it, woops. I've been playing a lot of [Slay the Spire 2](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/), and I wanted to make a much better snake game, but with a twist. So I made [Snecko](https://zeraphie.github.io/snecko/). At the beginning it was just a terminal based game, but I made it in a way that allowed me to play it in the browser as well, and you can still play it in either way.

Over time it became a pretty large project, with different game modes, boss fights, and even a mini souls-like boss fight. It became my testing and experimentation ground for random ideas and interests I wanted to explore. I see this game in two different ways, a technical exploration of cool concepts, and a fun game to play.

## What is it?
Snecko is primarily a snake based roguelike, where the core loop is to avoid walls, collect food, and make your way through "Acts". At the end of each Act, the player can choose an ability, which falls under 3 main categories: consumables, passives, and bites.

### Upgrades
- **Consumables:** Used upon a special consumable key, consuming one use. An example is the Portal consumable, which allows the player to place two portals on the map, seamlessly allowing the player to teleport between them.
- **Passives:** These are abilities that stay active for the Act
- **Bites:** These are abilities that stay active until the player has "bitten" food a certain number of times.

### Mutations
There is also a random chance that a player is offered an additional choice, which is known as a Mutation. This fundamentally changes the game mode between one of the other three Mutations. The 4 Mutations are:

- **Crystalline:** Crystals are scattered throughout the map, periodically spawning, growing, and decaying.
- **Wildlands:** Terrain is generated for the Act, with rivers spawning, surging and changing.
- **Catacombs:** A maze is generated for the Act, with walls moving and changing.
- **Brood:** The player places their brood on the map, and Sir Reginald tries to attack them. The player has the ability to shield, but this is a race against time, the brood must survive the end of the Act.

### Boss fights
At certain points during play, a secondary food will spawn, which when eaten will trigger a Boss fight. The boss fight operates under different rules, falling under 3 categories:

- **Bullet hell**: The snake transforms into an airplane, with a boss that is constantly firing at the player in differing patterns. Clear the boss of shields and then hit its core to defeat it.
- **Survival**: The boss is an invincible creature that is chasing the player throughout the area, the player must escape them for the duration of the timer to clear the boss.
- **Soulslike**: The snake is given a knife, and gets tired, the boss will constantly chase down the player with a variety of attacks, and the player must dodge, parry or strafe, while damaging the boss.

Boss fights also do not benefit from the normal upgrade system, and instead have a new system called Contraband. Contraband operate under the same rules as upgrades, but are dedicated to deal with boss fights. When defeating a boss fight, extra score is added, and a choice of Contraband is offered to the player.

## [!log] Brood, and the bird that hunts it

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## [!log] The terminal renderer earns its keep

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## [!log] Seeded runs, and what they cost

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
