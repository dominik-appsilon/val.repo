# Dynamic site POC (issue #12)

Proof of concept for rebuilding the val.repo site around client-side reports
driven by the `PACKAGES` file, instead of one pre-rendered HTML page per
package version.

- `index.qmd`: searchable, sortable index of all packages.
- `package.qmd`: one template page, `package.html?pkg=<name>`.
- `dcf.js`: `PACKAGES` parser (matches `read.dcf()`) plus a parser for
  val.meter's deparsed `Metric/<name>@R` values.
- `site.js`: data loading and display helpers shared by both pages.
- `data/metrics.json`: val.meter metric metadata, built by `metrics_json.R`.
- `data/PACKAGES`: 200 random val.meter-format packages
  (`val.meter::random_repo(n = 200)`, `set.seed(42)`).
- `data/PACKAGES.edge`: hand-written edge cases (NAs, missing metrics,
  unparseable values, duplicate records).

The data source is chosen with `?source=`: `fixture` (default), `edge`, or
`prod` (today's riskmetric-scored `PACKAGES` from `main` on
raw.githubusercontent.com, about 25k records, for testing at scale).

## Build and preview

```sh
quarto=/usr/share/positron/resources/app/quarto/bin/quarto  # or quarto on PATH
# optional, refresh metric metadata from a val.meter checkout
Rscript poc/metrics_json.R ../val.meter
$quarto preview poc/
```

## Measurements (Chromium, 2026-10-29)

- Parsing production `PACKAGES` (17 MB, 25,446 records): about 0.3–0.4 s.
- Index with production data, including the fetch from GitHub: about 2.7 s
  until the table is shown; search updates in about 20 ms.
- Package page with production data: about 0.5 s.

## Notes

- This is a separate Quarto project. Rendering the root project would also
  render `poc/`, so add a `render:` list to the root `_quarto.yml` (or move
  this directory) before merging to `main`.
- Do not publish this into pharmaR/val.repo's `gh-pages`; `quarto publish`
  replaces the whole branch and would take down the live site.
