# Personal Portfolio - Joydeep Medhi

This repository contains the source code for my personal portfolio website, built using GitHub Pages and Markdown.

## Overview

The portfolio showcases my professional experience, skills, projects, and publications as a Lead Data Scientist and Machine Learning Research Engineer.

## Local Development & Preview

This portfolio uses simple Markdown files for content and doesn't require a complex build process like Jekyll for local previewing.

1.  **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
2.  **Run the Local Server**:
    Open your terminal in the project directory (`portfolio`) and run:
    ```bash
    node server.js
    ```
3.  **View in Browser**: Open your web browser and navigate to `http://localhost:8080/preview.html`.

    *   This `preview.html` file provides a static preview of the site's structure and home page content.
    *   The navigation links in the preview will point to the respective `.md` files (`resume.md`, `projects.md`, etc.), allowing you to view their raw content locally.

## Content Management

*   **Pages**: Edit the content directly in the Markdown files (e.g., `index.md`, `resume.md`, `projects.md`, `publications.md`).
*   **Blog Posts**: Add new Markdown files to the `blog/_posts` directory following the naming convention `YYYY-MM-DD-your-post-title.md`.
*   **Configuration**: Modify basic site settings like title and description in `_config.yml`.
*   **Styling**: Customize the look and feel by editing the CSS within `_includes/head.html` or the main `preview.html` for local testing styles.

## Deployment

This site is configured for GitHub Pages.

*   Changes pushed to the `main` branch will automatically trigger a rebuild and deployment.
*   The live site is available at: [https://joydeepmedhi.github.io](https://joydeepmedhi.github.io)
