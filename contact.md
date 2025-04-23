---
layout: default
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
    <p>Use the form below to send me a message directly, or email me at <a href="mailto:{{ site.email }}">{{ site.email }}</a>.</p>
    
    <form class="contact-form" action="https://formspree.io/f/your-form-id" method="POST">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="_replyto" required>
      </div>
      
      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject" required>
      </div>
      
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" required></textarea>
      </div>
      
      <button type="submit" class="button">Send Message</button>
    </form>
    
    <p class="mt-2"><small>Note: To make this contact form work, you'll need to replace "your-form-id" in the form action with your actual Formspree form ID. <a href="https://formspree.io/" target="_blank">Sign up for Formspree</a> to get started.</small></p>
  </div>
</div>
