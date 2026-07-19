# Web de inversión — GitHub Pages

Sitio estático bilingüe (EN/ES) para publicar tesis de inversión, cartera en vivo y
track record. Construido con **Jekyll nativo de GitHub Pages**: publicar una tesis es
subir un fichero Markdown. Sin build local, sin npm, sin frameworks.

| Sección | URL | Contenido |
|---|---|---|
| Home | `/` | Presentación, filosofía, últimas tesis, stats en vivo |
| Tesis | `/theses/` | Archivo con filtros (mercado, sector, estado) |
| Tesis individual | `/thesis/<ticker>/` (EN) · `/tesis/<ticker>/` (ES) | Página propia por tesis |
| Cartera | `/portfolio/` | Holdings en vivo desde tu `data.json`, enlazados a sus tesis |
| Track record | `/track-record/` | Cerradas + agregados + curva valor vs capital |
| Metodología | `/methodology/` | Tu framework (placeholders para rellenar) |
| Sobre mí | `/about/` | Bio y contacto |

---

## 1 · Puesta en marcha (10 minutos)

1. **Crea el repositorio** `micro_cap_invest` en GitHub (público). El sitio queda en
   `https://trackcmg.github.io/micro_cap_invest/` — `_config.yml` ya viene
   configurado con ese `url` y `baseurl`. Si algún día cambias el nombre del repo,
   cambia `baseurl` a `"/nuevo-nombre"`; con dominio propio, `baseurl: ""`.
2. **Sube todo el contenido de esta carpeta** al repo (rama `main`).
3. En GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / root**.
4. Edita **`_config.yml`** — todos los campos marcados `[EDITAR]`:
   - `title`, `tagline`, `description`, `author_name`
   - `url` (¡importante para SEO y para compartir en Twitter!)
   - `substack_url`, `twitter_url`, `twitter.username`, `email`
5. Rellena los textos marcados `[EDIT / EDITAR]` en:
   - `index.html` (filosofía de la home — hay un texto por defecto razonable)
   - `methodology.html` (los 4 bloques del framework + proceso)
   - `about.html` (bio y contacto)
6. Haz push. GitHub construye el sitio solo (1–2 min). Los errores de build, si los
   hubiera, aparecen en la pestaña **Actions** del repo.

> **Marca visual**: el monograma usa la inicial de `author_name`. La imagen para
> compartir en redes es `assets/img/og-default.png` (1200×630) — reemplázala cuando
> quieras junto con `favicon.svg`, `favicon-32.png` y `apple-touch-icon.png`.

---

## 2 · Publicar una tesis nueva (el flujo importante)

**Una tesis = un fichero Markdown + sus imágenes. Cero HTML.**

### Paso a paso

1. Copia `_templates/thesis-template.md` a la carpeta del idioma:
   - inglés → `_theses_en/spsy-l.md` → publica en `/thesis/spsy-l/`
   - español → `_theses_es/spsy-l.md` → publica en `/tesis/spsy-l/`

   *Nombre de fichero*: minúsculas, sin espacios, puntos → guiones
   (`SPSY.L` → `spsy-l.md`).

2. Rellena el frontmatter (está documentado campo a campo en la propia plantilla).
   Lo crítico:
   - **`ticker`** — exactamente como aparece en tu dashboard (`"SPSY.L"`, `"BQE.V"`).
     Es la clave que hace que la fila de Cartera y de Track record enlace a la tesis.
   - **`date`**, **`status`** (`open`/`closed`), `market`, `sector` (alimentan los filtros),
     `market_cap` (capitalización al publicar), `description` (resumen para tarjeta y SEO),
     `substack` (link al artículo completo si existe).

3. **Imágenes**: crea la carpeta `assets/theses/<TICKER>/` y deja ahí los PNG/JPG
   (charts, capturas de cuentas anuales, tablas). En el Markdown, **siempre con el
   prefijo `../../`** (así funcionan igual en este repo, en otro o con dominio):

   ```markdown
   ![Evolución de ingresos 2015-2025](../../assets/theses/SPSY.L/revenue.png)
   *Ingresos y owner earnings. Fuente: cuentas anuales.*
   ```

   La línea en *cursiva* justo debajo de la imagen se muestra como pie de foto.
   Para la imagen de compartir en Twitter, añade en el frontmatter
   `image: /assets/theses/SPSY.L/cover.png` (ideal 1200×630) — este campo es la
   excepción: va con ruta absoluta y el sistema le añade el baseurl solo.

4. `git add . && git commit -m "Tesis SPSY.L" && git push` — listo.

### Tesis en dos idiomas

Crea los dos ficheros (uno en `_theses_en/`, otro en `_theses_es/`) con **el mismo
`ticker`**. Automáticamente:
- cada página enlaza a su versión en el otro idioma,
- el archivo muestra una sola tarjeta (la del idioma que esté viendo el visitante),
- la cartera enlaza a la versión del idioma activo.

Una tesis puede existir en un solo idioma sin ningún problema — se muestra tal cual
en ambas vistas.

### Cómo enlaza la cartera con las tesis

Automático, por convención: se compara el `ticker` del frontmatter con el ticker del
`data.json` (mayúsculas/minúsculas y el `*` de cierres parciales se ignoran; `MPE`
casa con `MPE.L` por símbolo base). Si un ticker cambió o cotiza con otro símbolo,
añade variantes en el frontmatter: `aliases: ["ACME.TO", "ACM"]`.

---

## 3 · Datos de cartera y track record

La web **no publica importes por diseño**: ni valor de cartera, ni capital
desplegado, ni tamaños de posición, ni P&L. Solo composición, fechas de apertura y
precios de entrada.

### Cartera (`portfolio.json`)

La página Cartera lee `portfolio.json`, en la raíz de este repo. Una línea por
posición, sin cantidades:

```json
{ "ticker": "RNO", "name": "Renault Group", "currency": "EUR", "exchange": "Euronext" }
```

Añadir o quitar una posición = editar ese fichero y hacer push. El `ticker` enlaza
automáticamente con su tesis si existe. (La URL del fichero se configura en
`_config.yml` → `portfolio_data_url`, por si algún día quieres servirlo desde otro
sitio.)

### Track record (`_data/track_record.yml`)

La página Track record se genera desde `_data/track_record.yml`: una entrada por
posición con `name`, `ticker`, `date` (fecha de apertura, YYYY-MM-DD) y `price`
(precio de entrada, texto libre con símbolo de divisa):

```yaml
- name: "Renault Group"
  ticker: "RNO"
  date: 2026-07-18
  price: "€26.14"
```

Se ordena solo (la más reciente arriba) y cada fila enlaza con su tesis cuando está
publicada. Las posiciones sin tesis muestran `—`.

---

## 4 · Dominio propio

Ver `CNAME.example` (instrucciones dentro). Resumen: renómbralo a `CNAME` con tu
dominio como única línea, configura el DNS (CNAME `www` → `tuusuario.github.io`),
actívalo en Settings → Pages, y actualiza `url:` en `_config.yml`.

---

## 5 · SEO y compartir en redes

- Cada página emite título, meta description, canonical, Open Graph y Twitter Card
  (plugin oficial `jekyll-seo-tag`). Para que las URLs absolutas sean correctas,
  **rellena `url:` en `_config.yml`**.
- Cada tesis se comparte con su propia imagen si defines `image:` en el frontmatter;
  si no, usa `assets/img/og-default.png`.
- `sitemap.xml` se genera solo (plugin `jekyll-sitemap`); `robots.txt` ya lo referencia.

---

## 6 · Preview local (opcional)

No es necesario para publicar (GitHub construye por ti). Si quieres verlo en local:

```bash
gem install bundler
bundle install
bundle exec jekyll serve
# → http://localhost:4000
```

---

## 7 · Estructura

```
├── _config.yml            ← configuración y campos [EDITAR]
├── _theses_en/            ← tesis en inglés  (una por fichero .md)
├── _theses_es/            ← tesis en español
├── _templates/
│   └── thesis-template.md ← plantilla con el frontmatter documentado
├── _layouts/              ← default / page / thesis
├── _includes/             ← head, header, footer, tarjeta de tesis
├── assets/
│   ├── css/main.css       ← sistema de diseño (claro/oscuro)
│   ├── js/                ← i18n, datos, cartera, track record, filtros
│   ├── img/               ← og-default, favicons  ← reemplazables
│   └── theses/<TICKER>/   ← imágenes de cada tesis
├── api/theses.json        ← índice ticker→tesis (se genera solo)
├── index.html · theses.html · portfolio.html · track-record.html
├── methodology.html · about.html · 404.html
├── robots.txt · CNAME.example · Gemfile
```

### Idiomas

Inglés primario. El toggle EN/ES del header persiste en `localStorage` y también
acepta URL (`?lang=es`, útil para compartir). Textos de interfaz en
`assets/js/site.js` (diccionario `I18N`); bloques largos en las páginas con
`<span class="lang-en">` / `<span class="lang-es">`.

### Disclaimer

El aviso legal (no es recomendación de inversión) está en el footer de todas las
páginas y, en versión ampliada bilingüe, al pie de cada tesis. El texto vive en
`_includes/footer.html` y `_layouts/thesis.html`.
