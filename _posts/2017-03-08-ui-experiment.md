---
title: UI Experiment
icon: view_quilt
category: Personal-Projects
customjs:
  - ui-experiment/main.js
customcss:
  - //cdnjs.cloudflare.com/ajax/libs/flickity/1.1.1/flickity.min.css
  - /css/ui-experiment.css
---

When I used to play [Destiny](https://www.destinythegame.com/uk/en/home), I got inspired by their menus and decided to make UI concept based on it *(interactive example below)*

The experiment uses a two main pieces of interactivity for this, with a third for navigation

- The first piece is that of a custom cursor written in javascript which is based loosely on the destiny cursor
- The second of which is a function to handle the actual movement of the wrapper, and is designed to 'gravitate' the content towards the mouse based on what direction it's currently going in
- The third piece is using a library called [Flickity](http://flickity.metafizzy.co/) which is used to make the slider, while also keeping it mobile friendly so you can drag across the mouse while the wraper is gravitating

<div class="sandbox ui-experiment">{% include ui-experiment/main.html %}</div>
