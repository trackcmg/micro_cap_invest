---
# ══════════════════════════════════════════════════════════════
#  PLANTILLA DE TESIS / THESIS TEMPLATE
#
#  CÓMO PUBLICAR / HOW TO PUBLISH
#  1. Copia este fichero a / Copy this file to:
#       _theses_en/<ticker>.md   → English  → URL: /thesis/<ticker>/
#       _theses_es/<ticker>.md   → Español  → URL: /tesis/<ticker>/
#     Nombre de fichero en minúsculas, sin espacios; los puntos
#     del ticker se cambian por guiones (SOM.V → som-v.md).
#     Filename lowercase, no spaces; dots become hyphens.
#  2. Rellena el frontmatter de abajo / Fill in the frontmatter.
#  3. Imágenes en / Images live in:  assets/theses/<TICKER>/
#     y se insertan con Markdown estándar / inserted with plain Markdown:
#       ![Texto alternativo](../../assets/theses/ACME/revenue-chart.png)
#     (usa siempre el prefijo ../../ — funciona en cualquier repo/dominio)
#     (always use the ../../ prefix — works on any repo/domain)
#     Una línea en *cursiva* justo debajo se muestra como pie de foto.
#     An *italic* line right below renders as the caption.
#  4. git add + commit + push. Nada más. / That's it.
#
#  Si la misma tesis existe en ambos idiomas, usa EXACTAMENTE el
#  mismo `ticker` en los dos ficheros: se enlazarán entre sí
#  automáticamente y el archivo solo mostrará una tarjeta.
#  If the thesis exists in both languages, use EXACTLY the same
#  `ticker` in both files: they cross-link automatically.
# ══════════════════════════════════════════════════════════════

# ── OBLIGATORIOS / REQUIRED ──────────────────────────────────

title: ""
# Título visible y de SEO. Recomendado: "Empresa (MERCADO: TICKER) — idea en 5 palabras"
# Visible/SEO title. Suggested: "Company (MARKET: TICKER) — the idea in 5 words"

ticker: ""
# El ticker TAL CUAL aparece en tu dashboard (data.json), p. ej. "SPSY.L", "BQE.V".
# Es la clave que enlaza Cartera y Track record con esta tesis.
# The ticker EXACTLY as it appears in your dashboard data.json — it is the key
# that links Portfolio and Track record rows to this thesis.

date: 2026-01-01
# Fecha de publicación / Publication date (YYYY-MM-DD).

status: open
# open | closed  — estado de la posición / position status.

# ── RECOMENDADOS / RECOMMENDED ───────────────────────────────

market: ""
# Mercado de cotización, usado como filtro / Listing market, used as a filter.
# Ej./E.g.: AIM, TSXV, LSE, NYSE, Euronext, BME…

sector: ""
# Sector, usado como filtro / Sector, used as a filter. Ej.: Industrials, Mining…

market_cap: ""
# Capitalización EN EL MOMENTO DE PUBLICAR, texto libre / Market cap AT
# PUBLICATION, free text. Ej.: "£14m", "C$45m", "€28m".

description: ""
# Resumen de 1–3 frases. Aparece en la tarjeta del archivo, en la meta
# description y al compartir en redes. / 1–3 sentence summary shown on the
# archive card, meta description and social shares.

# ── OPCIONALES / OPTIONAL ────────────────────────────────────

substack: ""
# URL del artículo completo en Substack, si existe / Full write-up URL, if any.

image: ""
# Imagen para Twitter/OG al compartir (1200×630 aprox). Si se deja vacío se usa
# la imagen por defecto del sitio. / Social share image; site default if empty.
# OJO: este campo SÍ va con ruta absoluta (sin ../../), el sistema le añade el
# baseurl solo. / NOTE: this field DOES use an absolute path (no ../../).
# Ej.: /assets/theses/ACME/cover.png

aliases: []
# Otros símbolos que deben mapear a esta tesis / Other symbols that should map
# to this thesis. Ej.: ["ACME.TO", "ACM"]

closed_date:
# Solo si status: closed — fecha de cierre / close date (YYYY-MM-DD).

return_pct: ""
# Solo si status: closed — retorno realizado, texto libre / realized return,
# free text. Ej.: "+62%".
---

<!--
Cuerpo de la tesis en Markdown normal. Estructura sugerida (bórrala si quieres):
Thesis body in plain Markdown. Suggested skeleton (delete freely):

## The business / El negocio

## Why it's mispriced / Por qué está mal valorada

## Owner earnings & valuation / Owner earnings y valoración

## Moat / Ventaja competitiva

## Risks / Riesgos

## Asymmetry & sizing / Asimetría y tamaño de la posición

Imágenes / Images:
![Revenue since 2015](../../assets/theses/ACME/revenue.png)
*Revenue and owner earnings, 2015–2025. Source: annual reports.*
-->
