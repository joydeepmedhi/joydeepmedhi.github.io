# joydeepmedhi.github.io

Source for [joydeepmedhi.github.io](https://joydeepmedhi.github.io), the personal site of
Joydeep Medhi: Lead Data Scientist working on computer vision, generative AI and ML systems.

Built with Jekyll and published by GitHub Pages straight from `main` (no custom workflow).

## Editing content

Most content lives in data files, so pages stay consistent:

| File | Drives |
|---|---|
| `_data/resume.yml` | `/resume/`, homepage metrics and experience, structured data, search |
| `_data/publications.yml` | `/publications/`, homepage selected paper, BibTeX |
| `_data/projects.yml` | `/projects/`, homepage open-source list |
| `_data/expertise.yml` | homepage expertise chips, `knowsAbout` structured data, meta keywords |
| `_data/consulting.yml` | `/consulting/` |
| `_data/navigation.yml` | main navigation |

Blog posts are Markdown files in `blog/_posts/`. The PDF resume is
`assets/files/Joydeep_Medhi_Resume.pdf` (older versions live in `assets/files/archive/`).

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. GitHub Pages builds with Jekyll 3.10 and LibSass;
the stylesheet avoids Sass features LibSass lacks, so it compiles cleanly on both
that and a local Jekyll 4 / Dart Sass setup.

## Structure

- `_layouts/`, `_includes/` – page shell, header, footer, publication and metrics components
- `_sass/` – design tokens (`_tokens.scss`), base, layout, components, pages, syntax
- `assets/js/` – theme toggle, search palette (`search.js` + `/search.json`), post enhancements
