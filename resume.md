---
layout: default
title: "Resume – Lead Data Scientist (CV & GenAI)"
description: "Resume of Joydeep Medhi, Lead Data Scientist at Lowe's: CV & GenAI programme, 10+ engineers, $100M+ impact. Ex-Mercedes-Benz R&D, 5 patents, IIT Delhi."
permalink: /resume/
---
{%- assign r = site.data.resume -%}

<header class="page-header resume-header">
  <p class="eyebrow">Resume · updated {{ r.updated | date: "%b %Y" }}</p>
  <h1>Joydeep Medhi</h1>
  <p class="page-lede">{{ r.headline }}</p>
  <p class="resume-contact">
    Bengaluru, India ·
    <a href="mailto:{{ site.email }}">{{ site.email }}</a> ·
    <a href="https://www.linkedin.com/in/{{ site.linkedin_username }}" rel="me noopener noreferrer">linkedin.com/in/{{ site.linkedin_username }}</a> ·
    <a href="https://github.com/{{ site.github_username }}" rel="me noopener noreferrer">github.com/{{ site.github_username }}</a>
  </p>
  <p class="cta-row">
    <a class="button" href="{{ r.pdf | relative_url }}" download>Download PDF</a>
    <a class="button button-outline" href="mailto:{{ site.email }}">Email me</a>
    <a class="button button-outline" href="{{ '/joydeep-medhi.vcf' | relative_url }}" download>Save contact</a>
  </p>
</header>

{% include metrics.html %}

<section class="section" aria-labelledby="profile">
  <h2 class="section-title" id="profile">Profile</h2>
  <p class="resume-profile">{{ r.profile }}</p>
</section>

<section class="section" aria-labelledby="experience">
  <h2 class="section-title" id="experience">Experience</h2>
  {% for job in r.experience %}
  <article class="role">
    <header class="role-header">
      <h3 class="role-title">{{ job.title }}</h3>
      <span class="role-dates">{{ job.start }} — {{ job.end }}</span>
    </header>
    <p class="role-org">{{ job.org }}{% if job.org_note %} — {{ job.org_note }}{% endif %} · {{ job.location }}</p>
    <ul class="role-highlights">
      {% for h in job.highlights %}<li>{{ h }}</li>{% endfor %}
    </ul>
  </article>
  {% endfor %}

  <h3 class="resume-subhead">Earlier roles</h3>
  {% for job in r.earlier %}
  <article class="role role-compact">
    <header class="role-header">
      <h4 class="role-title">{{ job.title }} — {{ job.org }}</h4>
      <span class="role-dates">{{ job.dates }} · {{ job.location }}</span>
    </header>
    <p>{{ job.summary }}</p>
  </article>
  {% endfor %}
</section>

<section class="section" aria-labelledby="education">
  <h2 class="section-title" id="education">Education</h2>
  {% for ed in r.education %}
  <article class="role">
    <header class="role-header">
      <h3 class="role-title">{{ ed.school }}</h3>
      <span class="role-dates">{{ ed.dates }}</span>
    </header>
    <p class="role-org">{{ ed.degree }} · {{ ed.location }}</p>
    <p>{{ ed.details }}</p>
  </article>
  {% endfor %}
</section>

<section class="section" aria-labelledby="skills">
  <h2 class="section-title" id="skills">Technical skills</h2>
  <dl class="spec-list">
    {% for s in r.skills %}
    <dt>{{ s.area }}</dt>
    <dd>{{ s.items }}</dd>
    {% endfor %}
  </dl>
</section>

<section class="section" aria-labelledby="pubs">
  <h2 class="section-title" id="pubs">Publications and patents <a class="section-more" href="{{ '/publications/' | relative_url }}">Details →</a></h2>
  {% for paper in site.data.publications.papers %}
  <p><strong>{{ paper.title }}</strong><br><span class="role-org">{{ paper.venue }} — peer-reviewed publication · <a href="{{ paper.links[0].url }}" rel="noopener noreferrer">arXiv</a></span></p>
  {% endfor %}
  <p class="resume-subhead-inline">Patents filed — Mercedes-Benz R&amp;D India, 2020–2022</p>
  <ul class="role-highlights">
    {% for p in site.data.publications.patents %}<li>{{ p.title }}</li>{% endfor %}
  </ul>
</section>

<section class="section" aria-labelledby="awards">
  <h2 class="section-title" id="awards">Awards and recognition</h2>
  <dl class="spec-list spec-list-awards">
    {% for a in r.awards %}
    <dt>{{ a.when }}</dt>
    <dd>{{ a.what }}</dd>
    {% endfor %}
  </dl>
</section>

<section class="section" aria-labelledby="leadership">
  <h2 class="section-title" id="leadership">Leadership and community</h2>
  <ul class="role-highlights">
    {% for l in r.leadership %}<li>{{ l }}</li>{% endfor %}
  </ul>
</section>

<section class="section" aria-labelledby="themes">
  <h2 class="section-title" id="themes">Research and product themes</h2>
  <div class="themes-grid">
    {% for t in r.themes %}
    <div class="theme">
      <h3 class="theme-name">{{ t.name }}</h3>
      <p>{{ t.text }}</p>
    </div>
    {% endfor %}
  </div>
</section>

<p class="resume-footnote">
  Prefer paper? <a href="{{ r.pdf | relative_url }}" download>Download the PDF</a> (2 pages).
  The <a href="{{ r.previous_pdf | relative_url }}">previous version (October 2024)</a> is archived.
</p>
