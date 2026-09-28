// The initial theme is applied by an inline script in <head> to avoid a flash on load.
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  if (!themeToggle) return;

  const updateLabel = () => {
    const next = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
    themeToggle.setAttribute('title', `Switch to ${next} theme`);
  };
  updateLabel();

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Apply smooth transition
    htmlElement.classList.add('theme-transition');

    htmlElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('theme', newTheme); } catch (e) {}
    updateLabel();

    setTimeout(() => {
      htmlElement.classList.remove('theme-transition');
    }, 300);
  });
});
