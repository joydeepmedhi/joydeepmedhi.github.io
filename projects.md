---
layout: default
description: "Computer vision and deep learning projects by Joydeep Medhi: Faster R-CNN anchor optimisation, YOLOv5 vehicle tracking and retail shelf analytics."
title: "Computer Vision & Deep Learning Projects"
permalink: /projects/
---

<header class="page-header">
  <h1>Projects</h1>
  <p class="page-lede">Open-source computer vision and deep learning work. Most of my production systems are internal, so these are the pieces I can share.</p>
</header>

<div class="projects-container">
  {% for project in site.data.projects %}
  <article class="project-card">
    <h2 class="project-title">{{ project.title }}</h2>
    <p class="project-description">{{ project.description }}</p>
    <ul class="project-tech">
      {% for t in project.tech %}<li class="tech-tag">{{ t }}</li>{% endfor %}
    </ul>
    <a href="{{ project.url }}" class="project-link" rel="noopener noreferrer">View on GitHub <span aria-hidden="true">↗</span></a>
  </article>
  {% endfor %}
</div>

<p>More on <a href="https://github.com/{{ site.github_username }}" rel="noopener noreferrer">GitHub</a>. For research work, see <a href="/publications/">publications and patents</a>.</p>
