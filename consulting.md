---
layout: default
title: "AI & Computer Vision Consulting"
description: "AI consulting with Joydeep Medhi: AI strategy, generative AI and RAG systems, computer vision, edge deployment, technical due diligence and team workshops."
permalink: /consulting/
---

<div class="section">
  <h1 class="section-title">Consulting &amp; Advisory</h1>
  <p class="lead-in">
    I help companies turn AI ideas into systems that actually work in production. That might be a
    computer vision pipeline running on real cameras, a generative AI assistant grounded in your own
    data, or simply a clear-eyed answer to <em>"should we build this at all?"</em>
  </p>
  <p>
    I've spent eight years doing this inside large organisations: leading computer vision and GenAI R&amp;D at
    <strong>Lowe's</strong> (customer-tracking systems with $1M+ revenue impact) and building in-cabin perception
    for the <strong>Mercedes-Benz</strong> MBUX Interior Assistant. Along the way I've filed five patents and published at a NeurIPS workshop.
    I bring that experience to a small number of outside engagements.
  </p>
  <p class="cta-row">
    <a href="/contact/?type=consulting" class="button">Start a conversation</a>
    {% if site.booking_url and site.booking_url != "" %}<a href="{{ site.booking_url }}" class="button button-outline" target="_blank" rel="noopener">Book a call</a>{% endif %}
    <a href="mailto:{{ site.email }}?subject=Consulting%20enquiry" class="button button-outline">Email me</a>
  </p>
</div>

<div class="section">
  <h2 class="section-title">How I can help</h2>
  <div class="services-grid">
    {% for service in site.data.consulting.services %}
    <article class="service-card">
      <h3>{{ service.name }}</h3>
      <p>{{ service.description }}</p>
      <ul>
        {% for point in service.points %}<li>{{ point }}</li>{% endfor %}
      </ul>
    </article>
    {% endfor %}
  </div>
</div>

<div class="section">
  <h2 class="section-title">Ways to work together</h2>
  <div class="formats-grid">
    {% for format in site.data.consulting.formats %}
    <div class="format-card">
      <h3>{{ format.name }}</h3>
      <p>{{ format.detail }}</p>
    </div>
    {% endfor %}
  </div>
</div>

<div class="section">
  <h2 class="section-title">How it works</h2>
  <ol class="process-steps">
    <li><strong>Tell me about the problem.</strong> Use the <a href="/contact/?type=consulting">contact form</a> or email. A few lines on what you're trying to achieve and where you're stuck is plenty.</li>
    <li><strong>Intro call.</strong> A short, free conversation to see whether I'm the right person to help. If I'm not, I'll try to point you to someone who is.</li>
    <li><strong>Clear proposal.</strong> Scope, deliverables, timeline and cost, agreed in writing before any work starts.</li>
    <li><strong>Deliver and hand over.</strong> Working results plus documentation and knowledge transfer, so your team can carry things forward.</li>
  </ol>
</div>

<div class="section">
  <h2 class="section-title">Good fit</h2>
  <div class="fit-grid">
    <div>
      <h3>Teams I work well with</h3>
      <ul>
        <li>Startups adding computer vision or GenAI to their product</li>
        <li>Retail, automotive and industrial teams with camera data to put to use</li>
        <li>Engineering leaders who want an independent review before a big AI investment</li>
        <li>Data science teams who want to level up through workshops or mentoring</li>
      </ul>
    </div>
    <div>
      <h3>Good to know</h3>
      <ul>
        <li>Based in Bengaluru (IST) and happy to work remotely with teams worldwide</li>
        <li>I take on a limited number of engagements alongside my full-time role, so availability varies</li>
        <li>I'm glad to sign an NDA before we discuss anything confidential</li>
      </ul>
    </div>
  </div>
</div>

<div class="section">
  <h2 class="section-title">Let's talk</h2>
  <p>Not sure whether your problem is a fit? Ask anyway. A short email costs nothing.</p>
  <p class="cta-row">
    <a href="/contact/?type=consulting" class="button">Contact me</a>
    <a href="https://www.linkedin.com/in/{{ site.linkedin_username }}" class="button button-outline" target="_blank" rel="noopener">Message on LinkedIn</a>
  </p>
</div>
