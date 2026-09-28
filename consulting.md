---
layout: default
title: "AI & Computer Vision Consulting"
description: "AI consulting with Joydeep Medhi: AI strategy, generative AI and RAG, computer vision, edge deployment, technical reviews and workshops."
permalink: /consulting/
---

<div class="section">
  <h1 class="section-title">Consulting</h1>
  <p>I take on a small number of advisory engagements alongside my full-time role, drawing on applied AI work at Lowe's and Mercedes-Benz R&amp;D.</p>

  <ul class="service-list">
    {% for service in site.data.consulting.services %}
    <li><strong>{{ service.name }}</strong>: {{ service.description }}</li>
    {% endfor %}
  </ul>

  <p>Remote-friendly, based in Bengaluru (IST). Availability varies.</p>
  <p class="cta-row">
    <a href="/contact/?type=consulting" class="button">Get in touch</a>
    {% if site.booking_url and site.booking_url != "" %}<a href="{{ site.booking_url }}" class="button button-outline" target="_blank" rel="noopener">Book a call</a>{% endif %}
  </p>
</div>
