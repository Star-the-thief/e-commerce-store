# Partner logos

Drop each confirmed partner's official logo file here, named after its `id`
in [`site.json`](../site.json)'s `partners` array:

```
rb-fashion.svg
splash.svg
palm.svg
wear-mart.svg
```

`svg`, `png`, `webp`, `jpg` and `jpeg` are all supported (checked in that
order) — see [`src/lib/real-logos.js`](../../lib/real-logos.js).

Until a file exists for a given `id`, that partner renders as a clean text
wordmark instead, so the showcase never shows a broken image. Only add a
company to `partners` in `site.json` once the partnership is genuine and you
have permission to display its logo.
