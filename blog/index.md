---
layout: default
title: Blog
---

<div class="section">
  <h1 class="section-title">Blog</h1>
  <p>Thoughts, ideas, and insights on data science, programming, and technology.</p>
  
  {% if site.posts.size > 0 %}
    <ul class="post-list">
      {% for post in site.posts %}
      <li class="post-item">
        <h2>
          <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
        {% if post.categories.size > 0 %}
        <span class="post-categories">
          {% for category in post.categories %}
          <span class="post-category">#{{ category }}</span>
          {% endfor %}
        </span>
        {% endif %}
        <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
        <a href="{{ post.url | relative_url }}">Read more →</a>
      </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No posts yet. Check back soon!</p>
  {% endif %}
</div>
