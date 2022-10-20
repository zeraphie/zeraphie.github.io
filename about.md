---
title: About Me
icon: sentiment_very_satisfied
date: 2022-10-20
description: Here's a little about myself, like reasons behind the github user rename, plans for the future and more!
---

## Renaming my GitHub Username
A long while ago, I renamed my github account to [@zeraphie](https://github.com/zeraphie/) from [@lopeax](https://github.com/lopeax/) and wanted to have a small explanation as to the reason for the change

## Reasons
I am transgender and I felt that my username was too male and I wanted to update it to better reflect myself as well as it would help in having a new start. It was also one of the mental blocks that I had in reference to actually transitioning, and I've been working really hard to remove those mental blocks :) - They're all gone now! It's just finances I need to care about :)

### FAQ
I've had a lot of questions about myself after coming out to everybody, and I've set up a few responses to the more frequently asked ones, but I would be more than willing to answer any questions that may be asked, below is a little info :)

1. **My new name:** I have changed my name to Izzy Skye

2. **How long have I known:** I've pretty much known about this for my entire life, but I didn't really know that it was possible until I was about 20 years old, and it took 3 more years for me to actually go ahead because I was really worried about how I would end up.. But certain friends of mine have been seriously amazing about it and incredibly helpful :)

4. **Pronouns:** For some time I was ok with being called both he and she, but now I would prefer to be called she. I know that this is will be odd for some, which is why I would prefer it, and not demanding it

## The route taken
I'm well aware that renaming my GitHub isn't a small change to make, and it has been a bit of a pain for it (such as having to setup a new package in packagist for my [passwordGen](https://github.com/zeraphie/passwordGen) package. However there were a number of steps taken in order to do this, which may be useful for others to know :)

1. **Renaming my GitHub account:** It's relatively simple to rename a github account, it's just in the settings, however, there are a few things that cascade
    1. Repos under that username get automatically redirected to the new username
        1. Except to something like Packagist! (That's explained below)
    2. The old user becomes available again (So I just remade it to make sure noone misuses my old username!)
        1. If someone takes the old user, and then releases a repo of the same name, it won't redirect!
2. **Renaming my Packagist account:** Again this isn't too hard to do on it's own, however, it is a little bit of a pain to update packages for the new name
    1. Update the name of the package in your `composer.json`
    2. Update the email and add it to the GitHub user account (this was specific for me as I had a change in email as well!)
    3. Update references in the package itself (like installation instructions in a `README.md` file
    4. Resubmit the package to packagist
    5. Set the old package to abandoned in packagist, then reference the new one in the abandon message
    6. Delete and redo the packagist service (I'm not 100% sure why, but this fixed the auto-update problem)

## Anything else
I will be keeping an eye on the issues for this [repo](https://github.com/lopeax/info/issues) if people have questions :) I'm rather open about it and I promise I don't bite... much ;)!
