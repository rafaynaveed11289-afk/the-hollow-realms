# The Hollow Realm — website

A static website (plain HTML, CSS and JavaScript). There is **no build step** and no dependencies to install.

## Run it

Easiest: open `index.html` in a browser.

For a local server (recommended, closest to how it behaves when deployed):

```bash
# from this folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static host works for deployment (GitHub Pages, Netlify, Cloudflare Pages, a plain web server): upload the
contents of this folder as-is.

## Internet access needed at runtime

The site loads these from public CDNs, so previews need an internet connection:

- Google Fonts (Cinzel, Cinzel Decorative, Cormorant Garamond) — `<link>` tags in each page's `<head>`
- Font Awesome icons — cdnjs
- The trailer thumbnail/video link on `trailers.html` (YouTube)

## Structure

```
index.html  about.html  world.html  characters.html  gallery.html
highlights.html  trailers.html  buy.html  login.html
css/style.css     all styles; every responsive rule is in the RESPONSIVE section at the end
js/script.js      navigation, login (demo), buy form (demo), gallery lightbox, character archive
assets/           images (backgrounds, covers, characters, district maps, favicon)
```

## Responsive design in one paragraph

Desktop-first, with these breakpoints (all in the RESPONSIVE section of `css/style.css`):
`1279px` hamburger navigation · `900px` stacked hero + one-column feature cards ·
`700px` (portrait) pannable enlarged maps · `640px` phones · `380px` very small phones.
The two-column homepage hero between 901px and ~1363px scales fluidly from two variables
(`--bw` cover width, `--title` title size) defined on `.hero`, so it needs no extra breakpoints.
At 1364px and wider the hero is identical to the original design.

See `CHANGELOG.md` for what changed.
