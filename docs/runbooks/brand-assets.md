# Brand assets (Igreja Onda Brandbook 2027)

Canonical **in-repo** assets for `@onda/web-onda` live under:

```text
apps/web-onda/src/assets/brand/
  logo-igreja-onda-preto.png    # Logo 1 digital, dark mark on light surfaces
  logo-igreja-onda-branco.png   # Logo 1 digital, light mark on dark/primary
  grafismo-ondas-filled.png     # GRAFISMO 3 — filled blue ripples
  grafismo-ondas-line.png       # GRAFISMO 4 — line ripples (watermarks)
```

## Upstream kit (optional, local only)

The marketing Brandbook kit may also live outside the repo (e.g. a sibling `branding/` folder with `IgrejaOnda_ManualDeMarca.pdf`). **Cloud agents and CI must not depend on that path** — use the committed files above.

| In-repo filename | Upstream kit (when present) |
|------------------|-----------------------------|
| `logo-igreja-onda-preto.png` | `1. LOGO/IGREJA ONDA/LOGO 1 PRETO …@4x-8.png` |
| `logo-igreja-onda-branco.png` | `1. LOGO/IGREJA ONDA/LOGO 1 BRANCO …@4x-8.png` |
| `grafismo-ondas-filled.png` | `3. GRAFISMOS/GRAFISMO 3 …@4x-8.png` |
| `grafismo-ondas-line.png` | `3. GRAFISMOS/GRAFISMO 4 Ativo 10@4x-8.png` |

## Rules

- Do **not** embed Apple **SF Pro** font binaries (print/marketing only).
- Do **not** recreate the wordmark by typing Space Grotesk — use Logo 1 PNG (or a future Marketing SVG export).
- SVG wordmark swap is deferred until Marketing exports from Illustrator.

See TLC (archived): `.specs/archive/features/official-brandbook-web-onda/` · issue [#180](https://github.com/kairan/onda-volunteer/issues/180).
