---
layout: default
description: "Articles on machine learning, computer vision and data science by Joydeep Medhi."
title: Blog
---

<div class="section">
  <h1 class="section-title">Blog</h1>
  <p>Thoughts, ideas, and insights on data science, programming, and technology.</p>

  {% comment %}Posts live under blog/_posts, so Jekyll adds an implicit "blog" category to each; hide it.{% endcomment %}
  {% assign all_tags = "" | split: "" %}
  {% for post in site.posts %}
    {% assign all_tags = all_tags | concat: post.categories | concat: post.tags %}
  {% endfor %}
  {% assign all_tags = all_tags | uniq | sort %}

  <div class="hashtag-filter">
    <strong>Browse by Hashtag:</strong>
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
        <a href="{{ post.url | relative_url }}">Read more →</a>
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

<style>
.hashtag-link.active {
  background: var(--hashtag-hover-bg, #e0e7ef);
  color: var(--hashtag-hover-color, #007acc);
  border-color: var(--hashtag-hover-border, #b3c7e6);
  font-weight: 600;
}
.clear-filter { margin-left: 0.5rem; font-size: 0.9em; }
</style>
