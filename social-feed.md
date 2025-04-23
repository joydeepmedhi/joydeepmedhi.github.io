---
layout: default
title: Social Feed
permalink: /social-feed/
---

# Social Feed

<!-- Twitter Feed Section (on top) -->
<div class="section social-feed-top">
  <h2 class="section-title">Latest on X / Twitter</h2>
  <div class="twitter-feed">
    <div class="twitter-container">
      <a class="twitter-timeline" data-theme="light" data-chrome="noheader nofooter noborders transparent" data-tweet-limit="3" href="https://twitter.com/medhijoydeep?ref_src=twsrc%5Etfw">Tweets by @medhijoydeep</a>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    </div>
    <div class="text-center mt-2">
      <a href="https://twitter.com/medhijoydeep" target="_blank" rel="noopener" class="button button-outline">View more on X/Twitter</a>
    </div>
  </div>
</div>

<!-- Instagram Feed Section -->
<div class="section">
  <h2 class="section-title">Instagram Feed</h2>
  <div class="instagram-feed">
    <p class="feed-intro">Check out my travel photography and adventures on Instagram <a href="https://instagram.com/meek.traveller_/" target="_blank" rel="noopener">@meek.traveller_</a></p>
    <div class="instagram-container">
      <!-- Instagram Embed using LightWidget for public feeds -->
      <iframe src="https://cdn.lightwidget.com/widgets/your-widget-id.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%;border:0;overflow:hidden;" title="Instagram Feed" height="400"></iframe>
      <div class="text-center mt-2">
        <a href="https://instagram.com/meek.traveller_/" target="_blank" rel="noopener" class="button button-outline">View more on Instagram</a>
      </div>
    </div>
  </div>
</div>

<!--
  NOTE: Replace 'your-widget-id' in the iframe src above with the actual LightWidget or other embed service widget ID for meek.traveller_.
  Free public Instagram embeds are limited by Instagram's API restrictions. For a real feed, use a service like LightWidget, SnapWidget, or Instafeed.js.
-->

<script>
  // This is a simplified version that would need to be replaced with actual API calls
  // Instagram and Twitter APIs require authentication and proper setup
  
  document.addEventListener('DOMContentLoaded', function() {
    // Placeholder for Instagram feed
    const instagramFeed = document.getElementById('instagram-feed');
    const instagramPlaceholder = `
      <div class="social-feed-notice">
        <p>To display your Instagram feed, you'll need to:</p>
        <ol>
          <li>Set up an Instagram Basic Display API or Graph API</li>
          <li>Create an app in the Facebook Developer Portal</li>
          <li>Get access tokens and implement the API calls</li>
        </ol>
        <p>For a simpler alternative, consider embedding a widget from services like:</p>
        <ul>
          <li><a href="https://www.elfsight.com/instagram-feed-widget/" target="_blank">Elfsight</a></li>
          <li><a href="https://lightwidget.com/" target="_blank">LightWidget</a></li>
          <li><a href="https://www.powr.io/plugins/instagram-feed" target="_blank">POWr Instagram Feed</a></li>
        </ul>
      </div>
    `;
    instagramFeed.innerHTML = instagramPlaceholder;
    
    // Placeholder for Twitter feed
    const twitterFeed = document.getElementById('twitter-feed');
    const twitterPlaceholder = `
      <div class="social-feed-notice">
        <p>To display your X/Twitter feed, you can:</p>
        <ol>
          <li>Use the X (Twitter) widget by adding this code:</li>
          <li>
            <pre><code>&lt;a class="twitter-timeline" href="https://twitter.com/medhijoydeep"&gt;Tweets by @medhijoydeep&lt;/a&gt;
&lt;script async src="https://platform.twitter.com/widgets.js" charset="utf-8"&gt;&lt;/script&gt;</code></pre>
          </li>
        </ol>
        <p>Alternatively, use a third-party service like:</p>
        <ul>
          <li><a href="https://www.elfsight.com/twitter-feed-widget/" target="_blank">Elfsight Twitter Feed</a></li>
          <li><a href="https://www.powr.io/plugins/twitter-feed" target="_blank">POWr Twitter Feed</a></li>
        </ul>
      </div>
    `;
    twitterFeed.innerHTML = twitterPlaceholder;
  });
</script>

<style>
  .feed-intro {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
  
  .social-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .social-feed-notice {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    grid-column: 1 / -1;
  }
  
  .social-feed-notice pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.8rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  .social-feed-notice code {
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .social-feed-notice ul, .social-feed-notice ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    .social-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
