---
layout: default
title: "Blog – ML, Computer Vision & AI"
description: "Plain-English articles on machine learning, computer vision, generative AI and data science by Joydeep Medhi, with runnable code."
---

<header class="page-header">
  <h1>Writing</h1>
  <p class="page-lede">Plain-English explanations of machine learning, computer vision and data science, with code you can run.</p>
</header>

<nav class="topic-list" aria-label="Topics">
  <span>Topics:</span>
  {% for t in site.data.topics %}
  <a class="hashtag-link" href="{{ '/blog/topics/' | append: t[0] | append: '/' | relative_url }}">#{{ t[0] }}</a>
  {% endfor %}
  <a class="hashtag-link" href="{{ '/feed.xml' | relative_url }}">RSS</a>
</nav>

{% if site.posts.size > 0 %}
<ul class="post-list">
  {% for post in site.posts %}
    {% if forloop.first %}
      {% include post-card.html post=post featured=true %}
    {% else %}
      {% include post-card.html post=post %}
    {% endif %}
  {% endfor %}
</ul>
{% else %}
<p>No posts yet. Check back soon!</p>
{% endif %}

<script>
  // Older links used /blog/?tag=<topic>; send them to the topic page
  (function () {
    var tag = new URLSearchParams(window.location.search).get('tag');
    if (tag && /^[a-z-]+$/.test(tag)) window.location.replace('{{ "/blog/topics/" | relative_url }}' + tag + '/');
  })();
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Joydeep Medhi – Writing",
  "url": {{ site.url | append: page.url | jsonify }},
  "description": {{ page.description | jsonify }},
  "author": { "@id": {{ site.url | append: '/#person' | jsonify }} },
  "blogPost": [{% for post in site.posts %}
    { "@type": "BlogPosting", "headline": {{ post.title | jsonify }}, "url": {{ site.url | append: post.url | jsonify }}, "datePublished": {{ post.date | date_to_xmlschema | jsonify }}{% if post.image.path %}, "image": {{ site.url | append: post.image.path | jsonify }}{% endif %} }{% unless forloop.last %},{% endunless %}{% endfor %}
  ]
}
</script>
