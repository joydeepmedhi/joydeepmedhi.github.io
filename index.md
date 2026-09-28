---
layout: default
description: "Lead Data Scientist in Bengaluru building Computer Vision and Generative AI systems (LLMs, VLMs, RAG, agentic AI). IIT Delhi alumnus, open to AI consulting."
---

<section class="intro" aria-label="Introduction">
  <picture>
    <source srcset="/assets/images/profile.webp" type="image/webp">
    <img class="intro-photo" src="/assets/images/profile.png" alt="Portrait of Joydeep Medhi" width="500" height="500" fetchpriority="high" decoding="async">
  </picture>
  <div>
    <h1 class="intro-name">Joydeep Medhi</h1>
    <p class="intro-role">Lead Data Scientist, AI/ML<span class="sep">·</span>Lowe's<span class="sep">·</span>Bengaluru</p>
    <p class="intro-bio">
      I build <strong>computer vision</strong> and <strong>generative AI</strong> systems that leave the lab and
      run in the real world: in stores, in cars, and in products people use every day.
      I lead CV and GenAI R&amp;D at Lowe's, and before that built the perception behind the
      Mercedes-Benz MBUX Interior Assistant.
    </p>
    {% include social-links.html %}
    <p class="cta-row">
      <a class="button" href="/assets/files/Joydeep_Medhi_Resume.pdf" download>Download CV</a>
      <a class="button button-outline" href="/contact/">Get in touch</a>
    </p>
  </div>
</section>

<section class="section prose" aria-labelledby="about">
  <h2 class="section-title" id="about">About</h2>
  <p>
    At <strong>Lowe's Companies, Inc.</strong> I lead R&amp;D in computer vision and GenAI: real-time multi-camera
    customer tracking with <strong>$100M+ in business impact</strong>, and pioneering generative AI solutions built on
    <strong>vision-language models (VLMs)</strong> and <strong>retrieval-augmented generation (RAG)</strong>.
  </p>
  <p>
    At <strong>Mercedes-Benz R&amp;D India</strong> I developed core components of the MBUX Interior Assistant, including
    pose estimation, gesture recognition and face authentication, deployed on low-compute automotive hardware.
    That work led to a <a href="/publications/">NeurIPS workshop paper and five patents</a>.
    I hold a B.Tech &amp; M.Tech dual degree in Mathematics and Computing from <strong>IIT Delhi</strong>.
  </p>
</section>

<section class="section" aria-labelledby="experience">
  <h2 class="section-title" id="experience">Experience <a class="section-more" href="/resume/">Full resume →</a></h2>
  <ol class="entries">
    <li class="entry">
      <span class="entry-meta">2022 – now</span>
      <div>
        <h3 class="entry-title">Lead Data Scientist, AI/ML</h3>
        <p class="entry-sub">Lowe's Companies, Inc.</p>
        <p class="entry-body">Computer vision and GenAI R&amp;D: multi-camera tracking, VLM and RAG solutions, self-checkout optimisation.</p>
      </div>
    </li>
    <li class="entry">
      <span class="entry-meta">2018 – 2022</span>
      <div>
        <h3 class="entry-title">Senior ML Research Engineer</h3>
        <p class="entry-sub">Mercedes-Benz Research &amp; Development India</p>
        <p class="entry-body">MBUX Interior Assistant: pose, gesture and face recognition on embedded hardware.</p>
      </div>
    </li>
    <li class="entry">
      <span class="entry-meta">2018</span>
      <div>
        <h3 class="entry-title">Deep Learning Research Engineer</h3>
        <p class="entry-sub">Silversparro Technologies</p>
      </div>
    </li>
    <li class="entry">
      <span class="entry-meta">2013 – 2018</span>
      <div>
        <h3 class="entry-title">B.Tech &amp; M.Tech, Mathematics and Computing</h3>
        <p class="entry-sub">Indian Institute of Technology Delhi</p>
      </div>
    </li>
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
        <h3 class="entry-title"><a href="{{ project.url }}" rel="noopener">{{ project.title }}</a></h3>
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

<section class="section prose" aria-labelledby="contact">
  <h2 class="section-title" id="contact">Get in touch</h2>
  <p>
    I'm happy to talk about research collaborations, speaking, mentoring and
    <a href="/consulting/">select consulting work</a>. The quickest way to reach me is
    <a href="mailto:{{ site.email }}">{{ site.email }}</a>, or use the <a href="/contact/">contact page</a>.
  </p>
</section>
