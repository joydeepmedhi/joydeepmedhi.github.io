document.addEventListener('DOMContentLoaded', function() {
  // Initialize page with tech-focused animations
  initTechAnimations();
  
  // Theme toggle functionality - moved to theme-toggle.js
  
  // Add typing effect to terminal elements with cursor
  const terminals = document.querySelectorAll('.terminal-typing');
  terminals.forEach(terminal => {
    const text = terminal.textContent;
    terminal.innerHTML = '<span class="terminal-cursor">_</span>';
    
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        terminal.innerHTML = text.substring(0, i + 1) + '<span class="terminal-cursor">_</span>';
        i++;
        setTimeout(typeWriter, Math.random() * 40 + 30);
      } else {
        // Blink cursor after typing is complete
        terminal.innerHTML = text + '<span class="terminal-cursor blink">_</span>';
      }
    };
    
    setTimeout(() => typeWriter(), 500); // Slight delay before typing starts
  });
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Highlight code blocks with syntax highlighting
  highlightCodeBlocks();
  
  // Add scroll animations for sections
  initScrollAnimations();
  
  // Add active class to current page link
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.page-link');
    
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
      link.classList.add('active');
    }
  });
});

// Initialize tech-focused animations
function initTechAnimations() {
  // Add fade-in animation to sections
  const sections = document.querySelectorAll('.section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    section.style.transitionDelay = `${index * 0.1 + 0.2}s`;
    
    setTimeout(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 100);
  });
  
  // Add subtle hover effects to skill items
  const skillItems = document.querySelectorAll('.skill-item');
  skillItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-3px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
    });
  });
}

// Highlight code blocks with syntax highlighting
function highlightCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre code');
  if (codeBlocks.length > 0) {
    // Simple syntax highlighting for code blocks
    codeBlocks.forEach(block => {
      // Keywords to highlight
      const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch'];
      const types = ['string', 'number', 'boolean', 'null', 'undefined', 'true', 'false'];
      
      let html = block.innerHTML;
      
      // Highlight strings
      html = html.replace(/(["'])(.*?)\1/g, '<span class="code-string">$&</span>');
      
      // Highlight comments
      html = html.replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>');
      
      // Highlight keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        html = html.replace(regex, `<span class="code-keyword">${keyword}</span>`);
      });
      
      // Highlight types
      types.forEach(type => {
        const regex = new RegExp(`\\b${type}\\b`, 'g');
        html = html.replace(regex, `<span class="code-type">${type}</span>`);
      });
      
      block.innerHTML = html;
    });
  }
}

// Initialize scroll animations
function initScrollAnimations() {
  // Add animation to elements when they come into view
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.timeline-item, .project-card');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate-in');
      }
    });
  };
  
  // Run once on load
  setTimeout(animateOnScroll, 500);
  
  // Run on scroll
  window.addEventListener('scroll', animateOnScroll);
}
