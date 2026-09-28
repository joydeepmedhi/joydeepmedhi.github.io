---
layout: default
title: "Contact – Talks, Advisory & Collaboration"
description: "Contact Joydeep Medhi about talks and workshops, advisory roles, research collaboration and mentoring in computer vision and generative AI."
permalink: /contact/
redirect_from:
  - /consulting/
---

<div>
  <header class="page-header">
    <h1>Get in touch</h1>
    <p class="page-lede">Whether it's a talk, an advisory role, a research idea or a question about something I've written, I'd like to hear from you.</p>
  </header>

  <div class="contact-options">
    <a class="contact-option" href="?type=talk#message-form">
      <strong>Talks &amp; workshops</strong>
      <span>Conference and meetup talks, panels, guest lectures and hands-on workshops on computer vision and GenAI.</span>
    </a>
    <a class="contact-option" href="?type=advisory#message-form">
      <strong>Advisory</strong>
      <span>Advisory board or technical advisor roles for teams working in computer vision, GenAI and ML systems.</span>
    </a>
    <a class="contact-option" href="?type=collaboration#message-form">
      <strong>Research collaboration</strong>
      <span>Papers, open-source work or joint research in vision and generative AI.</span>
    </a>
    <a class="contact-option" href="?type=mentoring#message-form">
      <strong>Mentoring</strong>
      <span>Guidance for data scientists and ML engineers on skills and careers.</span>
    </a>
  </div>

  <div class="card mb-3">
    <h2 class="mb-2">Direct channels</h2>
    <p>Email is the fastest way to reach me: <a href="mailto:{{ site.email }}">{{ site.email }}</a>. I usually reply within a few days. My <a href="/resume/">resume</a> (<a href="/assets/files/Joydeep_Medhi_Resume.pdf" download>PDF</a>) and a <a href="/joydeep-medhi.vcf" download>contact card</a> are here too.</p>
    {% if site.booking_url and site.booking_url != "" %}<p><a href="{{ site.booking_url }}" class="button" target="_blank" rel="noopener noreferrer">Book a call</a></p>{% endif %}
    {% include social-links.html %}
  </div>

  <h2 class="section-title" id="message-form">Send a Message</h2>
  <form class="contact-form" id="contact-form" action="mailto:{{ site.email }}" method="post" enctype="text/plain">
    <div class="form-group">
      <label for="type">What's this about?</label>
      <select id="type" name="type">
        <option value="talk">Talk or workshop</option>
        <option value="advisory">Advisory role</option>
        <option value="collaboration">Research collaboration</option>
        <option value="mentoring">Mentoring</option>
        <option value="other" selected>Something else</option>
      </select>
    </div>

    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" autocomplete="name" required>
    </div>

    <div class="form-group">
      <label for="organisation">Company or organisation <small>(optional)</small></label>
      <input type="text" id="organisation" name="organisation" autocomplete="organization">
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <input type="text" id="subject" name="subject" required>
    </div>

    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="6" required placeholder="A few lines about what you're working on and how I might help."></textarea>
    </div>

    <button type="submit" class="button">Send Message</button>
  </form>

  <p class="mt-2"><small>Submitting opens your email app with the message pre-filled, so nothing is stored on this site.</small></p>
</div>

<script>
  (function() {
    var form = document.getElementById('contact-form');
    var typeSelect = document.getElementById('type');
    var labels = {
      talk: 'Talk', advisory: 'Advisory', collaboration: 'Collaboration',
      mentoring: 'Mentoring', other: 'Hello'
    };

    // Pre-select the enquiry type from ?type=... (used by links on this site)
    var requested = new URLSearchParams(window.location.search).get('type');
    if (requested && labels[requested]) typeSelect.value = requested;

    // Compose the message in the visitor's mail client (no third-party form backend needed)
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var organisation = document.getElementById('organisation').value.trim();
      var subject = '[' + labels[typeSelect.value] + '] ' + document.getElementById('subject').value.trim();
      var body = document.getElementById('message').value.trim() +
        '\n\n— ' + name + (organisation ? ', ' + organisation : '');
      window.location.href = 'mailto:{{ site.email }}?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  })();
</script>
