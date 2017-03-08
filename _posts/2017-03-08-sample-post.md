---
title: Sample Post
icon: code
category: Style Guide
---

## Intro

This responsive template uses no libraries! Just some clever ES6 and SCSS

This design is inspired by [material design](https://material.io/guidelines/)

Also supports all latest browsers, but chrome has the best experience!

---

## Text

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus commodi, harum quibusdam maxime voluptatum, labore nisi non doloremque veniam eveniet laudantium numquam molestias. Maxime ex repellendus ea laboriosam, labore, dolor qui? A repudiandae fugiat aliquam nesciunt magni ipsa sapiente, eius molestiae praesentium, maiores laboriosam officia hic, nam. Necessitatibus dolorum recusandae adipisci eum. Repudiandae numquam quos ut libero quisquam, nobis laboriosam!

---

## Blockquote

> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Distinctio, at, illum. Numquam quod dicta, deserunt ea iste tenetur soluta delectus!

---

## Table

This is a responsive table generated via markdown

| Header 1 | Header 2 |
|----------|----------|
| Value 1  | Value 2  |
| Value 3  | Value 4  |

---

## List

- List item 1
- List item 2
- List item 3
- List item 4
- List item 5
- List item 6

### To-do List

- [x] Todo list
- [ ] Todo list item 2

---

## Code

Here's some `inline code`

{% highlight javascript %}
function $initHighlight(block, cls) {
    try {
        if (cls.search(/\bno\-highlight\b/) != -1){
            return process(block, true, 0x0F) + ` class="${cls}"`;
        }
    } catch (e) {
        /* handle exception */
    }
    
    for (var i = 0 / 2; i < classes.length; i++) {
        if (checkCondition(classes[i]) === undefined){
            console.log('undefined');
        }
    }
}

export  $initHighlight;
{% endhighlight %}
