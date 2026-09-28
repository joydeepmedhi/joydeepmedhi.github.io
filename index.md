---
layout: default
description: "Joydeep Medhi, Lead Data Scientist in Bengaluru: 8+ years shipping computer vision and GenAI (VLMs, RAG, agents) at Lowe's and Mercedes-Benz. IIT Delhi, NeurIPS."
---

<section class="intro" aria-label="Introduction">
  <picture>
    <source srcset="/assets/images/profile.webp" type="image/webp">
    <img class="intro-photo" src="/assets/images/profile.png" alt="Portrait of Joydeep Medhi" width="500" height="500" fetchpriority="high" decoding="async">
  </picture>
  <div>
    <h1 class="intro-name">Joydeep Medhi</h1>
    <p class="intro-role">Lead Data Scientist<span class="sep">·</span>Computer Vision &amp; GenAI<span class="sep">·</span>Bengaluru</p>
    <p class="intro-bio">
      I build <strong>computer vision</strong> and <strong>generative AI</strong> systems that hold up under real
      conditions: tight latency budgets, sparse labels and unpredictable environments. I lead the CV and GenAI
      programme at <strong>Lowe's</strong>, and before that owned the in-cabin perception stack of the
      <strong>Mercedes-Benz MBUX Interior Assistant</strong>.
    </p>
    {% include social-links.html %}
    <p class="cta-row">
      <a class="button" href="/assets/files/Joydeep_Medhi_Resume.pdf" download>Download CV</a>
      <a class="button button-outline" href="/resume/">View resume</a>
      <a class="button button-outline" href="/contact/">Get in touch</a>
    </p>
  </div>
</section>

{% include metrics.html %}

<section class="section prose" aria-labelledby="about">
  <h2 class="section-title" id="about">About</h2>
  <p>
    At <strong>Lowe's Companies Inc.</strong>, a Fortune 50 retailer with 1,700+ stores, I run the computer vision
    and GenAI programme across store intelligence, associate tooling, inventory and checkout automation, leading
    <strong>10+ DS/AI engineers</strong>. Our real-time <strong>multi-camera multi-target tracking</strong> pilot
    delivered $1M+ in incremental revenue and grew into a programme with <strong>$100M+ in business impact</strong>;
    I also built a GenAI voice assistant combining <strong>RAG</strong>, <strong>VLM</strong> visual grounding and
    streaming LLM inference.
  </p>
  <p>
    At <strong>Mercedes-Benz R&amp;D India</strong> I owned the in-cabin perception stack for the MBUX Interior
    Assistant: multi-camera pose estimation, gesture recognition and occupancy detection on embedded automotive
    ECUs at under 20 ms latency. That work produced a <a href="/publications/">NeurIPS 2020 paper and five patents</a>.
    I hold a B.Tech &amp; M.Tech dual degree in Mathematics and Computing from <strong>IIT Delhi</strong>.
  </p>
</section>

<section class="section" aria-labelledby="experience">
  <h2 class="section-title" id="experience">Experience <a class="section-more" href="/resume/">Full resume →</a></h2>
  <ol class="entries">
    {% for job in site.data.resume.experience %}
    <li class="entry">
      <span class="entry-meta">{{ job.start | split: ' ' | last }} – {% if job.end == "Present" %}now{% else %}{{ job.end | split: ' ' | last }}{% endif %}</span>
      <div>
        <h3 class="entry-title">{{ job.title }}</h3>
        <p class="entry-sub">{{ job.org }}</p>
        <p class="entry-body">{{ job.summary }}</p>
      </div>
    </li>
    {% endfor %}
    {% for job in site.data.resume.earlier %}
    <li class="entry">
      <span class="entry-meta">{{ job.dates | split: ' ' | last }}</span>
      <div>
        <h3 class="entry-title">{{ job.title }}</h3>
        <p class="entry-sub">{{ job.org }}</p>
      </div>
    </li>
    {% endfor %}
    {% for ed in site.data.resume.education %}
    <li class="entry">
      <span class="entry-meta">{{ ed.dates | replace: ' — ', ' – ' }}</span>
      <div>
        <h3 class="entry-title">{{ ed.degree }}</h3>
        <p class="entry-sub">{{ ed.school }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>

<section class="section" aria-labelledby="publication">
  <h2 class="section-title" id="publication">Selected publication <a class="section-more" href="/publications/">Papers &amp; patents →</a></h2>
  {% for paper in site.data.publications.papers %}{% if paper.selected %}
    {% include publication.html paper=paper %}
  {% endif %}{% endfor %}
</section>

<section class="section" aria-labelledby="writing">
  <h2 class="section-title" id="writing">Writing <a class="section-more" href="/blog/">All posts →</a></h2>
  <ol class="entries">
    {% for post in site.posts limit:3 %}
    <li class="entry">
      <time class="entry-meta" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %Y" }}</time>
      <div>
        <h3 class="entry-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p class="entry-body">{{ post.description | default: post.excerpt | strip_html | truncatewords: 28 }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>

<section class="section" aria-labelledby="projects">
  <h2 class="section-title" id="projects">Open source <a class="section-more" href="/projects/">All projects →</a></h2>
  <ol class="entries">
    {% for project in site.data.projects %}
    <li class="entry">
      <span class="entry-meta">GitHub</span>
      <div>
        <h3 class="entry-title"><a href="{{ project.url }}" rel="noopener noreferrer">{{ project.title }}</a></h3>
        <p class="entry-body">{{ project.description }}</p>
      </div>
    </li>
    {% endfor %}
  </ol>
</section>

<section class="section" aria-labelledby="expertise">
  <h2 class="section-title" id="expertise">Expertise</h2>
  <div class="expertise-grid">
    {% for group in site.data.expertise %}
    <div class="expertise-group">
      <h3 class="expertise-title">{{ group.group }}</h3>
      <p class="expertise-summary">{{ group.summary }}</p>
      <ul class="chips">
        {% for item in group.items %}<li class="chip">{{ item }}</li>{% endfor %}
      </ul>
    </div>
    {% endfor %}
  </div>
</section>

<section class="section callout" aria-labelledby="contact">
  <h2 id="contact">Talks, advisory and collaboration</h2>
  <p>
    I'm open to talks and workshops, advisory roles and research collaborations in computer vision,
    generative AI and ML systems. The best way to reach me is
    <a href="mailto:{{ site.email }}">{{ site.email }}</a>, or see the <a href="/contact/">contact page</a>.
  </p>
  <p class="cta-row">
    <a class="button" href="/contact/">Get in touch</a>
    <a class="button button-outline" href="/assets/files/Joydeep_Medhi_Resume.pdf" download>Download CV</a>
    <a class="button button-outline" href="https://www.linkedin.com/in/{{ site.linkedin_username }}" rel="me noopener noreferrer">LinkedIn</a>
  </p>
</section>
