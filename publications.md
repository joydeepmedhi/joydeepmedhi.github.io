---
layout: default
title: "Publications & Patents in Computer Vision"
description: "Publications and patents by Joydeep Medhi in 6DoF pose estimation, in-cabin sensing and automotive AI."
permalink: /publications/
---

<div>
  <header class="page-header">
    <h1>Publications &amp; Patents</h1>
    <p class="page-lede">Research from my time at Mercedes-Benz Research &amp; Development India, mostly on understanding what happens inside a vehicle cabin using cameras.</p>
  </header>

  <section class="section">
    <h2 class="section-title">Publications</h2>
    {% for paper in site.data.publications.papers %}
      {% include publication.html paper=paper %}
    {% endfor %}
  </section>

  <section class="section">
    <h2 class="section-title">Patents filed</h2>
    <p class="patents-intro">Filed through Mercedes-Benz Research &amp; Development India. Recognised with the <em>High Quality Patent Award</em> and <em>Implemented Product Patent Award</em> (2022).</p>
    {% assign patents = site.data.publications.patents | sort: "year" | reverse %}
    {% for patent in patents %}
    <article class="publication-item patent-item">
      <span class="pub-badge">Patent filed · {{ patent.year }}</span>
      <h3>{% if patent.url %}<a href="{{ patent.url }}" target="_blank" rel="noopener noreferrer">{{ patent.title }}</a>{% else %}{{ patent.title }}{% endif %}</h3>
      <p class="publication-description">{{ patent.summary }}</p>
      {% if patent.tags %}
      <div class="project-tech">
        {% for tag in patent.tags %}<span class="tech-tag">{{ tag }}</span>{% endfor %}
      </div>
      {% endif %}
    </article>
    {% endfor %}
  </section>
</div>

<script>
  // Copy-to-clipboard for BibTeX blocks
  document.querySelectorAll('.copy-bibtex').forEach(function(button) {
    button.addEventListener('click', function() {
      var text = button.parentElement.querySelector('code').textContent;
      navigator.clipboard.writeText(text).then(function() {
        button.textContent = 'Copied!';
        setTimeout(function() { button.textContent = 'Copy'; }, 1500);
      });
    });
  });
</script>
