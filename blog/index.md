---
layout: default
description: "Plain-English articles on machine learning, computer vision, generative AI and data science by Joydeep Medhi, with runnable code."
title: "Blog – ML, Computer Vision & AI"
---

<div>
  <header class="page-header">
    <h1>Writing</h1>
    <p class="page-lede">Plain-English explanations of machine learning, computer vision and data science, with code you can run.</p>
  </header>

  {% comment %}Posts live under blog/_posts, so Jekyll adds an implicit "blog" category to each; hide it.{% endcomment %}
  {% assign all_tags = "" | split: "" %}
  {% for post in site.posts %}
    {% assign all_tags = all_tags | concat: post.categories | concat: post.tags %}
  {% endfor %}
  {% assign all_tags = all_tags | uniq | sort %}

  <div class="hashtag-filter">
    <span>Topics:</span>
    {% for tag in all_tags %}{% if tag != "blog" %}
      <a href="?tag={{ tag | downcase }}" class="hashtag-link">#{{ tag }}</a>
    {% endif %}{% endfor %}
    <a href="{{ '/blog/' | relative_url }}" class="clear-filter" hidden>Clear filter</a>
  </div>

  {% if site.posts.size > 0 %}
    <ul class="post-list">
      {% for post in site.posts %}
      {% assign post_tags = post.categories | concat: post.tags | uniq %}
      <li class="post-item" data-tags="{% for tag in post_tags %}{{ tag | downcase }} {% endfor %}">
        <h2>
          <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} · {{ post.content | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
        <span class="post-hashtags">
          {% for tag in post_tags %}{% if tag != "blog" %}
            <a href="?tag={{ tag | downcase }}" class="hashtag-link">#{{ tag }}</a>
          {% endif %}{% endfor %}
        </span>
        <p class="post-excerpt">{% if post.description %}{{ post.description }}{% else %}{{ post.excerpt | strip_html | truncatewords: 50 }}{% endif %}</p>
      </li>
      {% endfor %}
    </ul>
    <p class="no-posts-for-tag" hidden>No posts with this hashtag yet.</p>
  {% else %}
    <p>No posts yet. Check back soon!</p>
  {% endif %}
</div>

<script>
// Client-side hashtag filter (GitHub Pages is static, so ?tag= is handled here)
(function() {
  var params = new URLSearchParams(window.location.search);
  var tag = params.get('tag') ? params.get('tag').toLowerCase() : null;
  if (!tag) return;

  var visible = 0;
  document.querySelectorAll('.post-list .post-item').forEach(function(post) {
    var tags = (post.getAttribute('data-tags') || '').split(/\s+/);
    var match = tags.indexOf(tag) !== -1;
    post.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  document.querySelectorAll('.hashtag-link').forEach(function(link) {
    link.classList.toggle('active', link.textContent.replace(/^#/, '').toLowerCase() === tag);
  });

  var clear = document.querySelector('.clear-filter');
  if (clear) clear.hidden = false;
  var empty = document.querySelector('.no-posts-for-tag');
  if (empty && visible === 0) empty.hidden = false;
})();
</script>

