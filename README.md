# Ashish Pathania — academic portfolio

A static, dependency-free personal website. Plain HTML, CSS and vanilla
JavaScript: no build step, no framework, no external network requests.
Open `index.html` in a browser and it works.

## Contents

```
index.html                  the whole site (single page, anchored sections)
assets/css/style.css        design system: tokens, light/dark themes, layout
assets/js/main.js           theme toggle, mobile nav, scrollspy, filters, lightbox
assets/img/profile.jpg      portrait
assets/img/figures/*.webp   29 research figures (4 are animated WebP)
.nojekyll                   tells GitHub Pages to serve files as-is
```

## Publishing to GitHub Pages

The site is designed to live at `https://pathania-ashish.github.io`.

```bash
# from inside this folder
git init -b main
git add .
git commit -m "Personal academic website"
git remote add origin https://github.com/pathania-ashish/pathania-ashish.github.io.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: Deploy from a branch →
`main` / `(root)`**. The site is live in a minute or two.

To publish under an existing repository instead (e.g. `.../portfolio`), the URL
becomes `https://pathania-ashish.github.io/portfolio/`. All paths in the site
are relative, so it works from any subdirectory without changes.

## Editing

Everything is content-first and hand-editable:

- **Add a publication** — copy an existing `<li class="pub" data-status="published">`
  block in the Publications section. `data-status` must be `published` or
  `review`; the filter counts in `.filters` are written out by hand, so bump
  those too.
- **Add a talk** — copy an `<li class="tl">` block in the Talks timeline.
- **Add a research figure** — drop the image in `assets/img/figures/` and copy a
  `<button class="fig">` block. Set `data-full`, `data-title`, `data-cap`, and
  `data-bg="dark"` if the figure has a dark background (this paints the tile's
  backdrop to match instead of putting a dark image on white).
- **Colours and spacing** — the `:root` and `html[data-theme="dark"]` blocks at
  the top of `style.css` hold every colour, radius and shadow as a variable.

## Seeing stale content?

Browsers cache aggressively over `file://`, and clicking `index.html` when a tab
is already open often just re-focuses that tab without reloading. If an edit
doesn't show up:

1. **Ctrl+Shift+R** (Cmd+Shift+R on macOS) in the tab — a hard reload.
2. Or close the tab completely and reopen the file.
3. Or serve it instead, which sidesteps `file://` caching entirely:
   `python3 -m http.server 8765` from this folder, then open
   <http://localhost:8765>.

`style.css` and `main.js` are referenced with a `?v=N` query string. Bump that
number after editing them to force browsers to refetch.

## Notes

- The CV is deliberately **not** published here — no file and no link. If you
  ever want one, drop a PDF in `assets/files/` and add a link; don't ship a
  `.docx`, and remember anything committed to a public Pages repo is
  downloadable by URL even without a link pointing at it.
- Figures are WebP, including the four animations, which cut them from ~9 MB as
  GIF to ~2.3 MB. Every modern browser supports both.
- **Figures exported from the slides are RGBA with real transparency.** When
  converting one, composite it onto white (`Image.alpha_composite`) rather than
  calling `.convert("RGB")`, which discards the alpha channel and leaves
  transparent regions as solid black. Only `d5-multiscalar` and
  `d5-genetic-algo` are genuinely dark-background designs and carry
  `data-bg="dark"`.
- **Careful with the scroll-reveal.** Blocks marked `.reveal` fade in as you
  scroll. The hiding rule is written as `:where(html.reveal-on) .reveal` — the
  `:where()` is load-bearing. It holds the rule at zero specificity so that
  `.reveal.is-in` can override it; writing `html.reveal-on .reveal` instead
  scores higher and the "show" rule silently loses, leaving the whole page
  blank below the hero. `main.js` also adds `.reveal-on` only once it has armed
  the reveal, and drops it unconditionally after 6 s, so a missing or broken
  script can never hide content.
