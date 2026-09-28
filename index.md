---
layout: default
description: "Lead Data Scientist in Bengaluru building Computer Vision and Generative AI systems (LLMs, VLMs, RAG, agentic AI). IIT Delhi alumnus, open to AI consulting."
---

<div class="hero">
  <div class="hero-content">
    <picture>
      <source srcset="/assets/images/profile.webp" type="image/webp">
      <img src="/assets/images/profile.png" alt="Joydeep Medhi, AI/ML Scientist" class="profile-pic" width="500" height="500" fetchpriority="high" decoding="async">
    </picture>
    <h1 class="animate-text">Joydeep Medhi</h1>
    <p class="lead">AI/ML Scientist</p>
    <p class="location">Bengaluru, India</p>
    <p class="lead-subtitle">Lead Data Scientist building <strong>Computer Vision</strong> and <strong>Generative AI</strong> systems (LLMs, VLMs, RAG and agents) that ship to production.</p>
    {% include social-links.html %}
    <p class="hero-actions">
      <a href="/consulting/" class="button">Work with me</a>
      <a href="/assets/files/Joydeep_Medhi_Resume.pdf" class="button button-outline" download>Download CV</a>
    </p>
  </div>
</div>

<div class="section">
  <h2 class="section-title">About Me</h2>
  <p>
    I am a Lead Data Scientist and Machine Learning Research Engineer based in Bengaluru, India, with a strong background in <strong>Computer Vision</strong>, <strong>Generative AI (LLMs, VLMs, RAG)</strong>, and <strong>Deep Learning</strong>. With a B.Tech & M.Tech Dual Degree in Mathematics and Computing from IIT Delhi, I focus on developing innovative AI solutions for complex real-world problems.
  </p>
  <p>
    My experience spans leading R&D initiatives at <strong>Lowe's Innovation Labs</strong>, driving significant revenue impact through AI-driven customer experience optimization, and developing core ML components for <strong>Mercedes-Benz R&D</strong>, including advanced driver-assistance systems (MBUX Interior Assistant) involving pose estimation, gesture recognition, and face authentication. I am passionate about pushing the boundaries of AI and translating research into tangible products.
  </p>
</div>

<div class="section">
  <h2 class="section-title">Core Expertise</h2>
  <div class="expertise-grid">
    {% for group in site.data.expertise %}
    <section class="expertise-group">
      <h3 class="expertise-title">{{ group.group }}</h3>
      <p class="expertise-summary">{{ group.summary }}</p>
      <ul class="skills-list">
        {% for item in group.items %}<li class="skill-item">{{ item }}</li>{% endfor %}
      </ul>
    </section>
    {% endfor %}
  </div>
</div>

<div class="section education-section">
  <h2 class="section-title">Education</h2>
  <div class="education-highlight">
    <p><strong>B.Tech & M.Tech Dual Degree</strong> in Mathematics and Computing</p>
    <p class="education-institute">Indian Institute of Technology Delhi (IITD)</p>
    <p class="education-year">2013 - 2018</p>
  </div>
</div>

<div class="section">
  <h2 class="section-title">Featured Experience</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-date">July 2022 - Present</div>
      <h3 class="timeline-title">Lead Data Scientist - AI/ML</h3>
      <div class="timeline-subtitle">Lowe's Companies Inc</div>
      <p>Leading R&D in CV & GenAI. Developed customer tracking systems ($1M+ revenue impact) & pioneered VLM/RAG solutions.</p>
    </div>
    <div class="timeline-item">
      <div class="timeline-date">Dec 2018 - June 2022</div>
      <h3 class="timeline-title">Senior ML Research Engineer</h3>
      <div class="timeline-subtitle">Mercedes-Benz R&D India</div>
      <p>Developed core CV components for MBUX Interior Assistant (pose, gesture, tracking). Led Face Recognition module development.</p>
    </div>
  </div>
  <p class="text-center mt-3">
    <a href="/resume/" class="button">View Full Resume</a>
  </p>
</div>

<div class="section">
  <h2 class="section-title">Featured Project</h2>
  <div class="projects-container">
    <div class="project-card">
      <h3 class="project-title">Retail Shelf Empty Space Detection</h3>
      <p class="project-description">Computer vision solution for detecting empty spaces in retail store shelves and racks. Helps optimize inventory management and improve restocking efficiency in retail environments.</p>
      <div class="project-tech">
        <span class="tech-tag">Computer Vision</span>
        <span class="tech-tag">Python</span>
        <span class="tech-tag">Deep Learning</span>
        <span class="tech-tag">Retail Analytics</span>
      </div>
      <a href="https://github.com/joydeepmedhi/bbox_detection" class="project-link" target="_blank" rel="noopener">View on GitHub <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  <p class="text-center mt-3">
    <a href="/projects/" class="button">View All Projects</a>
  </p>
</div>

<div class="section">
  <h2 class="section-title">Selected Publication</h2>
  {% for paper in site.data.publications.papers %}{% if paper.selected %}
    {% include publication.html paper=paper %}
  {% endif %}{% endfor %}
  <p class="text-center mt-3">
    <a href="/publications/" class="button">Publications &amp; Patents</a>
  </p>
</div>

<div class="section">
  <h2 class="section-title">Latest Writing</h2>
  <ul class="post-list">
    {% for post in site.posts limit:3 %}
    <li class="post-item">
      <h3><a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }} · {{ post.content | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
      <p class="post-excerpt">{{ post.description | default: post.excerpt | strip_html | truncatewords: 40 }}</p>
    </li>
    {% endfor %}
  </ul>
  <p class="text-center mt-3">
    <a href="/blog/" class="button">All Posts</a>
  </p>
</div>

<div class="section">
  <h2 class="section-title">Work With Me</h2>
  <p>I help teams turn AI ideas into working systems, from strategy and architecture reviews to hands-on computer vision and GenAI builds. I'm also happy to talk about research collaborations, speaking and mentoring.</p>
  <p class="text-center cta-row">
    <a href="/consulting/" class="button">Consulting &amp; Advisory</a>
    <a href="/contact/" class="button button-outline">Get in Touch</a>
  </p>
</div>
