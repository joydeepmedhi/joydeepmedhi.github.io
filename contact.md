---
layout: default
description: "Get in touch with Joydeep Medhi about AI/ML projects, collaborations or opportunities."
title: Contact
---

<div class="section">
  <h1 class="section-title">Get in Touch</h1>
  
  <p>I'm always open to discussing new projects, opportunities, or collaborations. Feel free to reach out!</p>
  
  <div class="card mb-3">
    <h3 class="mb-2">Connect with Me</h3>
    {% include social-links.html %}
  </div>
  
  <div class="section">
    <h2 class="section-title">Send a Message</h2>
    <p>Use the form below, or email me directly at <a href="mailto:{{ site.email }}">{{ site.email }}</a>.</p>
    
    <form class="contact-form" id="contact-form" action="mailto:{{ site.email }}" method="post" enctype="text/plain">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" autocomplete="name" required>
      </div>

      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject" required>
      </div>

      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="6" required></textarea>
      </div>

      <button type="submit" class="button">Send Message</button>
    </form>

    <p class="mt-2"><small>Submitting opens your email app with the message pre-filled.</small></p>
  </div>
</div>

<script>
  // Compose the message in the visitor's mail client (no third-party form backend needed)
  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    var subject = document.getElementById('subject').value.trim();
    var message = document.getElementById('message').value.trim();
    var body = message + '\n\n— ' + name;
    window.location.href = 'mailto:{{ site.email }}?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
</script>
