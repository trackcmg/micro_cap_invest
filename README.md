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

1. **Crea el repositorio** en GitHub:
   - `tuusuario.github.io` → el sitio queda en `https://tuusuario.github.io`
   - o cualquier otro nombre (p. ej. `investing`) → queda en
     `https://tuusuario.github.io/investing` y **debes** poner `baseurl: "/investing"`
     en `_config.yml`.
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
   (charts, capturas de cuentas anuales, tablas). En el Markdown:

   ```markdown
   ![Evolución de ingresos 2015-2025](/assets/theses/SPSY.L/revenue.png)
   *Ingresos y owner earnings. Fuente: cuentas anuales.*
   ```

   La línea en *cursiva* justo debajo de la imagen se muestra como pie de foto.
   Para la imagen de compartir en Twitter, añade en el frontmatter:
   `image: /assets/theses/SPSY.L/cover.png` (ideal 1200×630).

   > Nota: si publicas en un repo de proyecto (con `baseurl`), antepón el baseurl
   > a las rutas de imagen dentro del Markdown: `/investing/assets/theses/...`.
   > Con sitio de usuario o dominio propio (lo habitual) no hace falta nada.

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

Las páginas **Cartera** y **Track record** leen un JSON con el esquema de tu
dashboard (`holdings`, `closedTrades`, `history`, `cash`, `totalInvested`). La URL
se configura en `_config.yml`:

```yaml
portfolio_data_url: "https://trackcmg.github.io/data.json"
```

**Por defecto apunta al `data.json` público de tu dashboard actual**, que ya se sirve
con CORS abierto — funciona sin tocar nada. Se actualiza cada vez que haces push de
`data.json` en el repo `trackcmg.github.io`.

### Opción B — endpoint público en tu Apps Script (datos siempre al día)

Tu Web App de GAS exige sesión de Google (correcto para el dashboard privado). Para
la web pública puedes añadir una acción de **solo lectura y sin datos sensibles** al
principio de tu `doGet(e)`, antes de la validación de sesión:

```javascript
// —— Público: datos sanitizados para la web de tesis ——
if (e.parameter.action === 'publicData') {
  // Lee el MISMO fichero JSON de Drive que usa tu acción getData.
  // Sustituye la línea siguiente por tu función real de lectura:
  var d = JSON.parse(leerJsonDeDrive_());
  var pub = {
    updated: new Date().toISOString(),
    holdings: (d.holdings || []).map(function (h) {
      return { ticker: h.ticker, name: h.name, shares: h.shares,
               currency: h.currency, exchange: h.exchange, entryPrice: h.entryPrice };
    }),
    closedTrades: d.closedTrades || [],
    history: d.history || [],
    cash: d.cash || 0,
    totalInvested: d.totalInvested || 0
    // Nota: gym/books/movies/series NO se incluyen.
  };
  return ContentService.createTextOutput(JSON.stringify(pub))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Después: **Deploy → Manage deployments → New version** y pon en `_config.yml`:

```yaml
portfolio_data_url: "https://script.google.com/macros/s/TU_ID/exec?action=publicData"
```

### Opción C — fichero en este repo

Copia un `portfolio.json` con ese esquema a la raíz de este repo y apunta
`portfolio_data_url: "/portfolio.json"`. Máximo control, actualización manual.

### Privacidad

Dos interruptores en `_config.yml` (por defecto apagados):

```yaml
show_entry_prices: false   # precio medio de entrada en la tabla de Cartera
show_eur_amounts: false    # P&L realizado en EUR en Track record
```

Con ambos en `false` la web pública muestra composición, pesos (a coste), retornos
porcentuales y la curva de valor — sin importes por posición.

### Fechas de entrada/salida en Track record

Tu `closedTrades` actual no guarda fechas, así que esas columnas muestran `—`. Si
añades `entryDate: "2024-03-01"` y `exitDate: "2025-01-15"` (ISO) a cada trade del
JSON, aparecen automáticamente. Los cierres parciales (`AMR*`) se marcan con `*`.

### Cálculo de retornos

Réplica del `calcTrade` de tu dashboard, en divisa local:
`retorno % = (acciones × (venta − compra) + dividendos) / (acciones × compra)`.
Incluye dividendos; excluye comisiones, impuestos y efecto divisa. El FX (para pesos
de cartera y EUR opcionales) usa `open.er-api.com` con fallback a tipos estáticos —
la misma cadena que tu dashboard.

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
