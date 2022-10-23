---
title: Discord Date Formatter
icon: today_outlined
category: Personal-Projects
description: A walkthrough of how the discord date formatter was made, a tool that gives an easy to use interface to send localised datetimes in discord.
date: 2022-10-23
---

I use discord a **lot**. Like a lot a lot. I have groups of friends that are located in various parts of the world, and it's confusing as heck to transform the times that they say into my own time, for get togethers, D&D sessions, sometimes work and a lot more. Discord has this fancy feature that I don't really see anyone apart from discord bots using, with which you can give a specifically formatted timestamp and it will display that in the user's local timezone, making it soooo much easier to organise things.

However, the amount of people who'll be able to get that timestamp is comparitively very few compared to the user base, so I wanted to make a tool that fixed that, giving a nice and easy to use manner by which a user can generate this formatted timestamp, and what I ended up with was [this tool](https://zeraphie.github.io/discord-date-formatter/).

## The Format

[This reddit post](https://www.reddit.com/r/discordapp/comments/ob2h2l/discord_added_new_timestamp_formatting/) describes the addition of localised dates.

> **Discord Date Format**
> 
> An example of the timestamp is this: `<t:1666556580:F>` which would result in `Sunday, October 23, 2022 22:23 pm` being the time in the GMT+2 timezone.
>
> The format is as follows: `<t:${Math.floor(Date.now() / 1000)}:flag>` where `Date.now()` is the timestamp wanted, and `flag` is a preset set of formats to transform into:
> 
> | Flag | Format |
> | `t` | Short Time (i.e. `22:23 pm`) |
> | `T` | Long Time (i.e. `22:23:00 pm`) |
> | `d` | Short Date (i.e. `23/10/2022`) |
> | `D` | Long Date (i.e. `23 October 2022`) |
> | `f` | Short Date/Time (i.e. `October 23, 2022 22:23`) |
> | `F` | Long Date/Time (i.e. `Sunday, October 23, 2022 22:23 pm`) |
> | `R` | Relative Time (i.e. `10 minutes ago`) |
>
> Note: The format of the date is somewhat dictated by local settings in discord and your device, an easy way to check what kind of format you have is hover over the timestamp of one of a message.

## The Technologies
Having been primarily a Reactjs developer for a number of years I ended up using that lib for this, alongside the now deprecated Momentjs for date handling, you can see the code over on my [codepen](https://codepen.io/chrysokitty/pen/YzrBEQv) for the project. The first iteration used the base date and time inputs, as well as a select for the different formats of the date that I could find. Then it would highlight the timestamp in an easily selectable element, and show a version of what it would look like from inside a discord message.

Later on, I used [chronojs](https://github.com/wanasit/chrono) to make an input field that a user could type in colloquially and have that automatically transformed, like a user could say `8pm` and it would return the next 8pm timestamp, it's just generally an easier way to use it for non technical minded users :)

## In usage
The tool's been available for usage since March 2022, and a lot of my friends and groups I'm in have started using it for announcements and general get togethers as well, and it's been a massive godsend, no more need to ask "when is 8pm?" which sounds like a stupid question, but is very different when you have a group where there's multiple timezones involved, especially with the amount of different labels that americans have for timezones (if I hear PST or PDT or whichever one more time...). For the future I'd like to make a bot that can automatically recognise a time being posted and then post a new one on the lines of "Did you mean xxx?" using this tool, but that'd involve things like hosting and I think this might be enough.. Depends on the traction and if it's requested more :D