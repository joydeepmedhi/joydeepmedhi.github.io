---
layout: default
title: Home
---

<section class="hero">
  <img src="{{ '/assets/images/profile.jpg' | relative_url }}" alt="Profile Photo" class="hero-image">
  <h1 class="hero-title">Joydeep Medhi</h1>
  <p class="hero-subtitle">Lead Data Scientist | Machine Learning Research Engineer</p>
  <p class="hero-description">
    I specialize in Computer Vision, Generative AI, and Machine Learning solutions. Passionate about developing cutting-edge AI technologies that solve real-world problems and drive innovation.
  </p>
  <div class="hero-buttons">
    <a href="{{ '/resume/' | relative_url }}" class="button">View Resume</a>
    <a href="{{ '/contact/' | relative_url }}" class="button button-outline">Get in Touch</a>
  </div>
</section>

<section class="section">
  <h2 class="section-title">About Me</h2>
  <p>
    Hello! I'm a Lead Data Scientist and Machine Learning Research Engineer with extensive experience in developing advanced AI solutions. I specialize in Computer Vision, Generative AI, and designing cutting-edge machine learning models for enterprise applications.
  </p>
  <p>
    With a background in Mathematics and Computing from IIT Delhi, I combine strong theoretical foundations with practical expertise to solve complex problems. Currently at Lowe's, I lead R&D initiatives in Computer Vision and AI, previously having worked at Mercedes-Benz Research where I developed innovative solutions for automotive applications.
  </p>
  <p class="terminal terminal-typing">
    const interests = ['Computer Vision', 'Generative AI', 'LLMs', 'RAG', 'Multi-Camera Tracking', '3D Vision'];
  </p>
</section>

<section class="section">
  <h2 class="section-title">Skills</h2>
  <ul class="skills-list">
    <li class="skill-item">PyTorch</li>
    <li class="skill-item">TensorFlow</li>
    <li class="skill-item">Computer Vision</li>
    <li class="skill-item">LLMs</li>
    <li class="skill-item">Generative AI</li>
    <li class="skill-item">RAG</li>
    <li class="skill-item">Python</li>
    <li class="skill-item">C++</li>
    <li class="skill-item">CUDA</li>
    <li class="skill-item">Deep Learning</li>
    <li class="skill-item">3D Vision</li>
    <li class="skill-item">Multi-Camera Tracking</li>
    <li class="skill-item">Pose Estimation</li>
    <li class="skill-item">Docker</li>
  </ul>
</section>

<section class="section">
  <h2 class="section-title">Featured Work</h2>
  <div class="card">
    <h3>Customer Experience Optimization</h3>
    <p>Led the development of real-time multi-person tracking systems using trajectory analysis to map customer interactions and associate engagements. Implemented semi-supervised learning and active learning frameworks to enhance object detection mAP by 15%. The Customer Service Alerting System drove over $1M in incremental revenue.</p>
  </div>
  <div class="card">
    <h3>MBUX Interior Assistant</h3>
    <p>Designed Computer Vision/Deep Learning based solution for Car Interior Scene Understanding at Mercedes-Benz. Developed Multi-Camera Multi-Person Human Pose Estimation, Gesture Recognition, and Tracking systems for embedded automotive hardware.</p>
  </div>
</section>

<section class="section">
  <h2 class="section-title">Latest Blog Posts</h2>
  <ul class="post-list">
    {% for post in site.posts limit:3 %}
    <li class="post-item">
      <h3>
        <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
      <a href="{{ post.url | relative_url }}">Read more →</a>
    </li>
    {% endfor %}
  </ul>
  <p class="text-center">
    <a href="{{ '/blog/' | relative_url }}" class="button button-outline">View All Posts</a>
  </p>
</section>
