# Joydeep Medhi — Data Science Portfolio

This repository contains the source code for my professional portfolio website, built with Jekyll, GitHub Pages, and Markdown. It is designed for easy editing, modern SEO, and a minimal, coder-friendly look.

---

## 🚀 Features
- **Modern, minimal design** — clean, responsive, and easy to customize
- **SEO optimized** — powered by `jekyll-seo-tag`, `jekyll-sitemap`, and rich social meta
- **Favicon & Apple Touch Icon** — custom JM branding for all devices
- **Blog, Resume, Publications, Social Feed** — all editable in Markdown
- **Easy deployment** — works on GitHub Pages or Docker/Jekyll locally
- **Analytics-ready** — Google Analytics integration included
- **Accessible & mobile-friendly**

---

## 🛠️ Local Development

### Using Docker (Recommended)
1. **Install Docker** if you haven’t already.
2. In the project directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser to [http://localhost:4000](http://localhost:4000)
   - Live reload is enabled for fast editing.
   - Sitemap is available at `/sitemap.xml`.

### Using Bundler/Jekyll (Alternative)
1. Install Ruby, Bundler, and Jekyll.
2. Run:
   ```bash
   bundle install
   bundle exec jekyll serve
   ```
3. Visit [http://localhost:4000](http://localhost:4000)

---

## ✍️ Editing Content
- **Pages:** Edit Markdown files like `index.md`, `resume.md`, `projects.md`, `publications.md`, etc.
- **Blog:** Add posts to `blog/_posts/` using `YYYY-MM-DD-title.md` format.
- **Config:** Change site settings, social links, and meta in `_config.yml`.
- **Styling:** Edit `_sass/_base.scss` for CSS. Favicon and icons in project root.

---

## 🌐 Deployment
- **GitHub Pages:**
  - Push to the `main` branch. GitHub Pages will build and deploy automatically.
  - Live at: [https://joydeepmedhi.github.io](https://joydeepmedhi.github.io)
- **Custom Domain:** Set in your repo settings and update `_config.yml`.

---

## 🧠 SEO & Best Practices
- **Meta tags:** Managed by `jekyll-seo-tag` and `_config.yml`.
- **Sitemap:** Auto-generated at `/sitemap.xml` for search engines.
- **robots.txt:** Present for crawler instructions.
- **Social sharing:** Optimized for Twitter, LinkedIn, and more.
- **Favicon:** Provided in `.ico` and `.svg` formats; Apple touch icon included.

---

## 📄 License & Credits
- MIT License. Feel free to fork and adapt.
- Built by Joydeep Medhi — Lead Data Scientist & ML Research Engineer

---

**Questions or suggestions?** Open an issue or contact me at [medhijoydeep@gmail.com](mailto:medhijoydeep@gmail.com).
