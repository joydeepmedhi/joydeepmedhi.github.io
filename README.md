# Joydeep Medhi - Portfolio

A minimal, coding-style portfolio for a Data Scientist and Machine Learning Research Engineer. Clean, modern design with easy customization.

## Quick Start Guide

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/joydeepmedhi/joydeepmedhi.github.io.git
   cd joydeepmedhi.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local server**
   ```bash
   npm start
   ```

4. **View your portfolio**
   - Open your browser and navigate to `http://localhost:3000`

### Deployment

1. **Create a GitHub repository**
   - Create a new repository named `joydeepmedhi.github.io`

2. **Push your code**
   ```bash
   git remote add origin https://github.com/joydeepmedhi/joydeepmedhi.github.io.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll down to the GitHub Pages section
   - Select the `main` branch as the source
   - Click Save

4. **Your site is now live!**
   - It will be available at `https://joydeepmedhi.github.io`

## Personal Settings

### Basic Information

Edit the `_config.yml` file to update your personal information:

```yaml
title: Your Name
description: Your tagline
author: Your Name
email: your.email@example.com
```

### Social Media Links

Update your social media usernames in `_config.yml`:

```yaml
github_username: your-github-username
linkedin_username: your-linkedin-username
twitter_username: your-twitter-username
```

### Profile Photo

1. Replace the file at `assets/images/profile.jpg` with your own photo
2. Make sure to keep the same filename or update it in `_includes/header.html`

## Content Management

### Resume/CV

Edit the `resume.md` file to update your CV information. The file uses markdown format:

```markdown
## Education
- **University Name** | Degree | Year

## Experience
- **Company Name** | Position | Date Range
  - Responsibility 1
  - Responsibility 2
```

### Blog Posts

Add new blog posts by creating markdown files in the `blog/_posts` directory:

1. Create a new file with the naming format: `YYYY-MM-DD-title.md`
2. Add the following front matter at the top:

```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS +0000
categories: [category1, category2]
---
```

3. Write your post content in markdown below the front matter

### Home Page

Edit the `index.md` file to update your home page content.

## Styling Customization

### Theme Mode

Change between dark and light mode in `_config.yml`:

```yaml
theme_mode: dark # or light
```

### Color Scheme

Edit the `_sass/_variables.scss` file to customize colors:

```scss
$background-color-dark: #0d1117;
$background-color-light: #f8f9fa;
$text-color-dark: #e6edf3;
$text-color-light: #24292e;
$accent-color: #64ffda; // Change this to your preferred accent color
```

### Typography

Modify font settings in `_sass/_variables.scss`:

```scss
$font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
$font-family-sans: 'Inter', 'Open Sans', sans-serif;
```

## Advanced Customization

### Custom JavaScript

Add your custom JavaScript to `assets/js/main.js`

### Custom Layouts

Create or modify layout templates in the `_layouts` directory

### Custom Includes

Create reusable components in the `_includes` directory

## Need Help?

Feel free to open an issue if you have any questions or suggestions!
