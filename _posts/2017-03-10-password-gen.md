---
title: PasswordGen
icon: security
category: Personal-Projects
---

## Intro

After using laravel, I wanted to create a cryptographically secure password generator in order to add to projects, which is when I made [this](https://github.com/lopeax/passwordGen)

---

## Learning about cryptography

It was an interesting journey to create it since I hadn't looked into making things secure to this degree before, and learning about how random numbers were chosen was quite interesting!

In PHP 7.0.0 there is a function `random_int` which uses a few different methods for different operating systems (although this would be typically used on a linux server for this instance) in order to generate an unbiased random integer which has quite a few different uses! This one's taken directly from the php documentation

> Generates cryptographic random integers that are suitable for use where unbiased results are critical, such as when shuffling a deck of cards for a poker game.

---

## Deciding how to generate the password

> In cryptography, an algorithm's key space refers to the set of all possible permutations of a keys.

In my password generator however, I decided to generate a keyspace in order to randomly select characters from, so it's slightly different to the definition, but makes it easier to program (since you don't have to store millions of keys)

I used the `random_int` function in order to select the character for the password, selecting characters up until the pre-configured password character limit (with a minimum of 8 characters) and appending the selected character to the password string

I made a few helper functions in order to generate the keyspace as well, which selects which character groups (lowercase, uppercase, numbers, special characters and whitespace) for the user to select from, defaulting to all but whitespace (since some systems don't cope well with whitespace)

---

## Making a javascript port

I also decided that it would be interesting to make a javascript version of this in case that the user couldn't use PHP (or didn't know it)

I made it using ES6's class structure which is a lot more cumbersomb than PHP's but ended up with more or less the same result!

The random integer was more difficult to get however, so I made a helper function using the browser's crypto object (I only tested on chrome and firefox) which is as follows

```javascript
let randomInteger = (min, max) => {
    try {
        if(max < 256){
            let crypto = window.crypto || window.msCrypto;
            let byteArray = new Uint8Array(1);
            crypto.getRandomValues(byteArray);

            let range = max - min + 1;
            let max_range = 256;
            if (byteArray[0] >= Math.floor(max_range / range) * range) {
                return this.randomInteger(min, max);
            }
            return min + (byteArray[0] % range);
        } else {
            throw `Sorry the maximum is too large\n` +
                  `The maximum size is 256\n`;
        }
    } catch(e) {
        console.log(e);
    }
}
```
