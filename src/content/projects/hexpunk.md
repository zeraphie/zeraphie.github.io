---
title: Hexpunk
icon: hexagon
logo: hexpunk
description: "My hexagon based design system, built with high interactivity and layout in mind"
date: 2026-08-31
---

I've always been fascinated by a design concept called brutalism, more specifically the ideas behind why this design principle exists. The bit that caught my eye is breaking out of convention, and I see convention in everything that comes to web, though admittedly there's good reason for a lot of it. I've previously dabbled in hexagons in a few different ways, with my first UI concept with them being [this codepen](https://codepen.io/chrysokitty/pen/jzYKmE), which is sort of loosely based on two music rhythm games [VOEZ](https://rayark.com/g/voez/) & [Osu](https://osu.ppy.sh/).

Over the past decade, I've also worked on a number of different design systems as part of my work, and there's a lot of recurring patterns and also lack of certain interactions that I've noticed and wanted to break from and implement. So I started this [Hexpunk](/hexpunk/) project to implement a number of components that provide an easy interface for developers to use, and a completely different website experience for users.

However, there's a lot to be said about having a single source of truth for the design system. So I used [Google Labs' design.md](https://github.com/google-labs-code/design.md) as a specification to declare the design system's components and their behavior. This allowed me to generate quite a lot of what was needed for the design system, specifically tokens, and also keep components consistent across the design system.

> [!quote]
> _“One file is the source, everything else is output”_

There are a few main components that I wanted to make as part of this design system that aren't in others: a replacement for `<div>`, a replacement for `display: flex`, an interactive grid, and an interactive background.

## The hex cell
The replacement for `<div>` is the [`hp-cell`](/hexpunk/components/hex-core/hp-cell/) and the core shape of the system, providing a pre-calculated atom with which a developer can build components out of. It contains several different variants, sizes, and tones for customisation, but if it doesn't fit the use case, [`hp-hex`](/hexpunk/components/hex-core/hp-hex/) can be used as well, containing just the hexagon shape and math.

## The hex layout
[`hp-layout`](/hexpunk/components/hex-core/hp-layout/) is the component that provides the layout for the hex grid, and is responsible for the positioning and sizing of hex cells. It supports different layout options, such as `free`, `spiral` and `rows`, different sizes, and if the hexes are draggable. Drag and drop I wanted to specifically support out of the box since I think it's a sorely under-used and under-supported feature across systems, and can be used to let the user decide how to layout certain components.

## The hex grid
[`hp-grid`](/hexpunk/components/hex-core/hp-grid/) is the foundational world component for the Hexpunk system, providing a grid layout based on hexagons. Originally I was handrolling all the logic for this but it became a mammoth task and I knew that the library [PixiJS](https://pixijs.com/) exists and made integration for this much quicker and more consistent (especially since I was building trying to support both hardware accelerated browsers and not). The point of this was to provide a [Figma](https://www.figma.com/)-like experience to users, where they could zoom in/out, pan around the grid, drag hexes around the grid while also being flexible to different layout options.

It also changed the way that I approached navigation. While clicking links is a valuable thing to have, I wanted a way for a user to navigate without the need to click. And so I started on a concept of "diving", where by default, a hexagon placed on the grid could be zoomed into and reveal the content that it contains. This posed a number of challenges, and some are still being worked on now, but for now it uses metadata and prefetching to cascade loading of content as the user navigates the hex grid.

## The hex background
[`hp-background`](/hexpunk/components/hex-core/hp-background/) was made because I wanted an interactive background that wouldn't get in the way of displaying content. It shares a bunch of math and logic with [`hp-grid`](/hexpunk/components/hex-core/hp-grid/), but is meant to be more of an ambient message to the user that "hey, this site wakes up when you interact with it", with a radial gradient that tracks the cursor position making it obvious where the user is, to an "ignite" animation that plays when the user clicks or taps on something that isn't an interactive element. I was inspired by [Trystero](https://trystero.dev/)'s website after working on [Warrior of Keyboard](/warrior-of-keyboard/) to add something a bit more interactive into it, but I didn't want to go as far since I wanted the focal point to still be the content of the site.
