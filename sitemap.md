---
title: Sitemap
icon: line_style
date: 2022-10-22 00:00:00 +0000
description: Contains the sitemap for the site for users to use
---

A useful collection of links for this site

---

<ul class="sitemap">
    <li>
        <a href="/" class="pjax-link waves-effect">Home</a>
    </li>
    {% for category in site.categories %}
        <li>
            <span>{{ category | first | replace: '-', ' ' }}</span>
            <ul>
                {% for posts in category %}
                    {% for post in posts %}
                        {% if post.category %}
                            <li>
                                <a href="{{ post.url }}" class="pjax-link waves-effect">{{ post.title }}</a>
                            </li>
                        {% endif %}
                    {% endfor %}
                {% endfor %}
            </ul>
        </li>
    {% endfor %}
    {% for post in site.posts %}
        {% unless post.category or post.url == page.url %}
            <li>
                <a href="{{ post.url }}" class="pjax-link waves-effect">{{ post.title }}</a>
            </li>
        {% endunless %}
    {% endfor %}
</ul>
