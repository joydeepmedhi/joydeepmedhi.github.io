---
layout: default
title: Blog
---

<div class="section">
  <h1 class="section-title">Blog</h1>
  <p>Thoughts, ideas, and insights on data science, programming, and technology.</p>

  {% assign all_tags = "" | split: "" %}
  {% for post in site.posts %}
    {% if post.tags %}
      {% assign all_tags = all_tags | concat: post.tags %}
    {% endif %}
    {% if post.categories %}
      {% assign all_tags = all_tags | concat: post.categories %}
    {% endif %}
  {% endfor %}
  {% assign all_tags = all_tags | uniq | sort %}

  <div class="hashtag-filter">
    <strong>Browse by Hashtag:</strong>
    {% for tag in all_tags %}
      <a href="?tag={{ tag }}" class="hashtag-link">#{{ tag }}</a>
    {% endfor %}
    {% if page.url contains '?tag=' %}
      <a href="/blog/" class="clear-filter">Clear filter</a>
    {% endif %}
  </div>

  {% assign tag_filter = page.url | split: '?tag=' | last %}
  {% if tag_filter == page.url %}
    {% assign tag_filter = nil %}
  {% endif %}

  {% assign filtered_posts = site.posts %}
  {% if tag_filter %}
    {% assign filtered_posts = site.posts | where_exp: "post", "post.tags contains tag_filter or post.categories contains tag_filter" %}
  {% endif %}

  {% if filtered_posts.size > 0 %}
    <ul class="post-list">
      {% for post in filtered_posts %}
      <li class="post-item">
        <h2>
          <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
        <span class="post-hashtags">
          {% for tag in post.categories %}
            <a href="?tag={{ tag }}" class="hashtag-link">#{{ tag }}</a>
          {% endfor %}
          {% for tag in post.tags %}
            <a href="?tag={{ tag }}" class="hashtag-link">#{{ tag }}</a>
          {% endfor %}
        </span>
        <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
        <a href="{{ post.url | relative_url }}">Read more →</a>
      </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No posts yet. Check back soon!</p>
  {% endif %}
</div>
