---
layout: default
description: "Find Joydeep Medhi on X, LinkedIn, GitHub and Instagram."
title: Social Feed
permalink: /social-feed/
---

<div class="section">
  <h1 class="section-title">Social Feed</h1>
  <p class="feed-intro">Where to follow along — AI/ML thoughts, code, and travel photography.</p>

  <div class="social-cards">
    <a class="social-card" href="https://x.com/{{ site.twitter_username }}" target="_blank" rel="noopener">
      <span class="social-card-name">X / Twitter</span>
      <span class="social-card-handle">@{{ site.twitter_username }}</span>
      <span class="social-card-desc">Short takes on AI, ML research and tech.</span>
    </a>
    <a class="social-card" href="https://www.linkedin.com/in/{{ site.linkedin_username }}" target="_blank" rel="noopener">
      <span class="social-card-name">LinkedIn</span>
      <span class="social-card-handle">in/{{ site.linkedin_username }}</span>
      <span class="social-card-desc">Professional updates and career news.</span>
    </a>
    <a class="social-card" href="https://github.com/{{ site.github_username }}" target="_blank" rel="noopener">
      <span class="social-card-name">GitHub</span>
      <span class="social-card-handle">@{{ site.github_username }}</span>
      <span class="social-card-desc">Open-source code and experiments.</span>
    </a>
    <a class="social-card" href="https://instagram.com/{{ site.instagram_username }}/" target="_blank" rel="noopener">
      <span class="social-card-name">Instagram</span>
      <span class="social-card-handle">@{{ site.instagram_username }}</span>
      <span class="social-card-desc">Travel photography and adventures.</span>
    </a>
  </div>
</div>

<div class="section">
  <h2 class="section-title">Latest on X</h2>
  <div class="twitter-container">
    <a class="twitter-timeline" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="3" href="https://twitter.com/{{ site.twitter_username }}?ref_src=twsrc%5Etfw">View posts by @{{ site.twitter_username }} on X &rarr;</a>
  </div>
</div>

<script>
  // Match the embedded timeline to the site theme, then load the X widget
  (function() {
    var timeline = document.querySelector('.twitter-timeline');
    if (timeline) timeline.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') || 'dark');
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://platform.twitter.com/widgets.js';
    s.charset = 'utf-8';
    document.body.appendChild(s);
  })();
</script>

<style>
  .feed-intro {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .social-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .social-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.25rem;
    border: 1px solid var(--border-color, rgba(128, 128, 128, 0.3));
    border-radius: 8px;
    background-color: var(--card-bg, transparent);
    text-decoration: none;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .social-card:hover {
    transform: translateY(-3px);
    border-color: currentColor;
  }

  .social-card-name {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
  }

  .social-card-handle {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .social-card-desc {
    font-size: 0.9rem;
    color: var(--text-color, inherit);
    opacity: 0.85;
  }
</style>
