# BuyMyTimeBack

> Audit your wasted time — by day, week, month and year.

A static, multilingual (**FR / EN / ES / DE**) tool that turns the minutes you lose each day into a cold, numbered verdict: totals, a "share of waking life" bar, striking comparisons, and projections over 1, 5 and 10 years.

🔗 **Live:** https://bmtb.devalade.me

## Features

- Totals per **day / week / month / year**
- "Share of waking life consumed" life-bar
- Striking comparisons (books, films, marathons…)
- Projections over **1, 5, 10 years**
- "Automatable / eliminable" flag → recoverable time per year
- 4 languages with auto-detection + manual switcher
- 100% client-side — data stays in `localStorage`, nothing is sent anywhere

## Tech stack

- Plain HTML / CSS / JS — no framework, no build step
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI for deploys
- Google Fonts: _Fraunces_ + _Hanken Grotesk_

## Project structure

```
index.html        markup + SEO meta + JSON-LD
style.css         editorial design system
js/               ES modules (no build step)
  main.js         entry point
  app.js          state, DOM rendering, event binding
  calculator.js   pure calculation + formatting
  i18n.js         locales, translations, language detection
  storage.js      localStorage persistence
  constants.js    shared constants
  types.js        JSDoc type definitions
tests/            node --test suite
tests/calculator.test.js
robots.txt
sitemap.xml
_headers          Cloudflare Pages caching & security headers
favicon.svg
og.webp           social preview image (1200×630)
og-source.html    source used to regenerate og.webp
```

## Local development

```bash
npm install
npm run dev       # local server at http://localhost:8788
npm run test      # node built-in test runner
npm run lint      # eslint
npm run format    # prettier
```

## Deploy

```bash
npm run deploy    # uploads to Cloudflare Pages (production)
```

Requires `wrangler login` once.

## Regenerate the OG image

macOS, requires Google Chrome + [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot=og.png "file://$PWD/og-source.html"
cwebp -q 92 og.png -o og.webp && rm og.png
```

## License

MIT
