---
layout: default
title: "Contact & Consulting Enquiries"
description: "Contact Joydeep Medhi about AI consulting, computer vision and generative AI projects, research collaboration, speaking, mentoring or job opportunities."
permalink: /contact/
---

<div>
  <header class="page-header">
    <h1>Get in touch</h1>
    <p class="page-lede">Whether you have a project in mind, a research idea, or just a question about something I've written, I'd like to hear from you. Pick whatever fits best:</p>
  </header>

  <div class="contact-options">
    <a class="contact-option" href="{{ '/consulting/' | relative_url }}">
      <strong>Consulting &amp; advisory</strong>
      <span>AI strategy, GenAI/RAG, computer vision and edge deployment. See how I can help.</span>
    </a>
    <a class="contact-option" href="?type=collaboration#message-form">
      <strong>Research collaboration</strong>
      <span>Papers, open-source work or joint projects in vision and generative AI.</span>
    </a>
    <a class="contact-option" href="?type=speaking#message-form">
      <strong>Speaking &amp; workshops</strong>
      <span>Talks, panels, guest lectures and hands-on team workshops.</span>
    </a>
    <a class="contact-option" href="?type=mentoring#message-form">
      <strong>Mentoring</strong>
      <span>Guidance for data scientists and ML engineers on skills and careers.</span>
    </a>
    <a class="contact-option" href="?type=opportunity#message-form">
      <strong>Recruiters &amp; opportunities</strong>
      <span>Senior AI/ML leadership and research roles.</span>
    </a>
  </div>

  <div class="card mb-3">
    <h2 class="mb-2">Direct channels</h2>
    <p>Email is the fastest way to reach me: <a href="mailto:{{ site.email }}">{{ site.email }}</a>. I usually reply within a few days. Recruiters: here's my <a href="/assets/files/Joydeep_Medhi_Resume.pdf" download>CV (PDF)</a>, the <a href="/resume/">web resume</a>, and a <a href="/joydeep-medhi.vcf" download>contact card</a> you can save.</p>
    {% if site.booking_url and site.booking_url != "" %}<p><a href="{{ site.booking_url }}" class="button" target="_blank" rel="noopener">Book a call</a></p>{% endif %}
    {% include social-links.html %}
  </div>

  <h2 class="section-title" id="message-form">Send a Message</h2>
  <form class="contact-form" id="contact-form" action="mailto:{{ site.email }}" method="post" enctype="text/plain">
    <div class="form-group">
      <label for="type">What's this about?</label>
      <select id="type" name="type">
        <option value="consulting">Consulting / advisory project</option>
        <option value="collaboration">Research collaboration</option>
        <option value="speaking">Speaking or workshop</option>
        <option value="mentoring">Mentoring</option>
        <option value="opportunity">Job opportunity</option>
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
      consulting: 'Consulting', collaboration: 'Collaboration', speaking: 'Speaking',
      mentoring: 'Mentoring', opportunity: 'Opportunity', other: 'Hello'
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
