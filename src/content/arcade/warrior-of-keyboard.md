---
title: Warrior of Keyboard
icon: keyboard
description: "A co-op typing game for 1-4 players. Serverless peer-to-peer over WebRTC"
date: 2026-08-27
game: /warrior-of-keyboard/
---

[This project](/warrior-of-keyboard/) spawned after watching the keynote for FFXIV's Fan Festival 2026 in Berlin. I've been an avid player of the game for a long time, and one thing caught my eye, a minigame that'll be added to the Gold Saucer with FF7 theming called Keybound Brawler. I felt like it was such a strange minigame to add to FFXIV, but I also saw it as a chance to see how I'd convert the sort of template that I'd made with my [Snecko](/snecko/) game, and have a thorough multiplayer integration.

Similarly to Snecko I also wanted to have as few dependencies as possible, as well as focussing on a canvas experience so it'd be consistent whether or not the browser had hardware acceleration available. Above everything, I wanted to have an intent that kept things on track for the game

> [!quote]
> _“Does the game work without it?”_

This became one of the core questions that I'd ask myself before each feature.

## What is it?
Warrior of Keyboard is a co-op typing game for 1-4 players. Your score compounds by typing consistently and correctly, with a live leaderboard. Play vs your friends or compete vs bots.

## Multiplayer

I've been dabbling in [WebRTC](https://webrtc.org/) for a while, sometimes with [Socket.io](https://socket.io/) for things like chat interfaces, but I saw this as a fun way of seeing what tricks I could use to make a live feedback loop in a game. To this end I researched a library called [Trystero](https://trystero.dev/), as I specifically wanted a serverless multiplayer game that I could "host" on GitHub Pages.

The other half of the research was what exactly did I want to send over WebRTC, since a game like this can go in many different directions for it. However, in Snecko, I'd made a method of using seeded runs, and I combined this in Warrior of Keyboard with a word list to initiate the multiplayer using a seed, and from there broadcasting events for each player. This condensed the payload for what's sent to almost nothing, with instant feedback to all players, i.e. "seeing" the typing, the score updating, etc.

Due to wanting to design a serverless multiplayer, I needed to come up with a strategy to "play" the referee for the game. So I localised everything a player did to their own track, typing, score, damage, colour, name etc. The player has a profile where they can customise their name and colour, but it also means that each player is identifyable. And also, because the word list isn't sent over the network, there's a version check of the game build to ensure players are using the same version.

## Feedback

Since this game is fairly basic in terms of what the function of it is, I wanted to have a focussed zoom in on what feedback to the player meant. Even though I don't play it, I've seen a tonne of positive feedback for how Balatro plays and feels to play, so I wanted to incorporate some of the aspects from it.

### Scoring
I wanted to make the increase of a player's score exciting, more than just a number going up. I liked how Balatro animates its scoring and has some sfx feedback stacking for it, so I emulated something similar to that. I've also played a bunch of music rhythm games like Osu in the past, and wanted to reward fast but accurate typing, so I made a combo multiplier system that'd increase to 4x score progressively the more correct words were typed.

### Tracks
Visual clarity is important for a game like this as well, so I wanted to have 4 clear tracks where words would travel down towards the player, giving a visual representation of a timer, pushing the player to successfully clear a word before it reached them, or they'd take damage. I also wanted to colour match the tracks with the player and have some "lighting up" animation for when they typed to keep visual interactivity high.
