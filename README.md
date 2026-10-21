# La Botika Mockup

Static visual demo storefront for Farmacia La Botika. Plain HTML/CSS/vanilla JS + GSAP/ScrollTrigger and Lenis from CDN. No build step: open `index.html` or deploy the repo as-is to GitHub Pages.

## Structure (mirrors a Shopify OS 2.0 theme)

| Here | Shopify |
|---|---|
| `layout/theme.html` | `layout/theme.liquid` |
| `templates/index.html` (section markers + settings) | `templates/index.json` |
| `sections/<name>.html` (`{{ section.settings.x }}` placeholders) | `sections/<name>.liquid` |
| `snippets/product-card.html` | `snippets/product-card.liquid` |
| `assets/section-<name>.css/.js`, `base.css`, `theme.js` | `assets/` |
| `data/products.json` (Shopify product fields) | the store's products |

Each section's JS registers with `Theme.register(name, init)`, initialises inside its own `[data-section]` root, returns a cleanup function, and re-runs on `shopify:section:load` / `shopify:section:unload`.

## Editing

The root pages are generated from `layout/`, `templates/` and `sections/`, and they're committed. After editing any of those, re-run:

```sh
python3 -I scripts/assemble.py
```

`scripts/fetch-products.py` refreshes `data/` and the images from farmacialabotika.cl (one-off).

## Local preview

```sh
python3 -m http.server 8765   # http://localhost:8765
```
