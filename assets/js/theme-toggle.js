document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  const storedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme from localStorage or default to dark
  htmlElement.setAttribute('data-theme', storedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply smooth transition
    htmlElement.classList.add('theme-transition');
    
    // Update theme
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      htmlElement.classList.remove('theme-transition');
    }, 300);
  });
});
