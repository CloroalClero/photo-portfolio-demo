# Portfolio — Rubina

Galleria drag & zoom basata su [questo Pen GSAP](https://codepen.io/filipz/pen/dPGKGOo).

## Struttura del repo

Il **sito pubblicabile** sta nella **root** del progetto: `index.html`, i fogli **`style-shared.css`**, **`style-desktop.css`**, **`style-mobile.css`**, **`viewport-loader.js`**, la cartella **`js/`** (`script-desktop.js`, `script-mobile.js`, **`app.js`** come entry **ES module**, **`modules/`** con `fashion-gallery.js`, `drive-manifest.js`, `pf-helpers.js`), **`css/projects/`** (uno stylesheet per serie), la cartella **`portfolio/`** (`portfolio-config.js`, `projects/<categoria>/<id>/data.js`, `projects-registry.js`) e la cartella **`media/`**.

**Breakpoint** (CSS + JS): **900px** — desktop ≥901px, mobile ≤900px. Il JS carica lo stub mobile o desktop, poi **`js/app.js`** (modulo). Dopo un resize oltre la soglia serve un **refresh** per allineare stub e fogli `media`.

## Contenuti e progetti

Le immagini vivono in `media/projects/` (una cartella per progetto). Metadati e lista file: **`portfolio/projects/<categoria>/<id>/data.js`** (vedi `portfolio/projects/README.md`). `projects-registry.js` definisce l’ordine nel menu e le categorie su disco.

- Per **aggiornare le foto**: copia in `media/projects/<NomeCartella>/`, poi aggiorna l’array `images` nel `data.js` di quel progetto (o rigenera con `node tools/emit-portfolio-projects.mjs` se hai modificato lo script).
- **Anteprima**: dalla root del repo, `npx serve .` (oppure apri `index.html` tramite un server locale) così percorsi e script restano coerenti.

### Deploy e cartelle

Le foto **devono** stare in sottocartelle (`media/projects/NomeProgetto/…`): non è quello che rompe il deploy. Quello che conta è **cosa carichi sul server**:

1. **Struttura consigliata**: pubblica **index.html**, i tre CSS globali, **`viewport-loader.js`**, l’intera cartella **`js/`**, **`css/projects/`**, **`portfolio/`** e **`media/`**.
2. **GitHub Pages (repo `username.github.io/nome-repo`)**: se la root del sito è `https://…github.io/nome-repo/`, i percorsi relativi `media/projects/…` funzionano **purché** `media` sia nella stessa pubblicazione (non solo `index.html`).
3. **Sito in una sottocartella diversa da dove sono le immagini**: in `portfolio/portfolio-config.js` imposta `basePath` in `__PORTFOLIO_CONFIG__`, oppure definisci `window.__PORTFOLIO_BASE_PATH__` prima di caricare `viewport-loader.js`.
4. **File aperti con `file://`**: manifest Drive e alcuni asset possono fallire; usa sempre un piccolo server HTTP in locale per provare.

Nel menu **Progetti** puoi filtrare la griglia per serie; **Tutti** (o il logo) mostra l’intero catalogo.

## Immagini da Google Drive

Sì, è possibile: il sito costruisce gli URL con l’**ID file** di Drive (non il link “Apri in Drive” così com’è).

1. Carica le foto su Drive (stesso ordine che usi in ogni `portfolio/projects/<categoria>/<id>/data.js`).
2. Per ogni file: **Condividi** → accesso **Chiunque abbia il link** → **Visualizzatore**.
3. Dal link `https://drive.google.com/file/d/QUESTO_È_L_ID/view` copia solo l’ID (la lunga stringa tra `/d/` e `/view`).
4. In `portfolio/portfolio-config.js` imposta:
   - `imagesFrom: "drive"` dentro `__PORTFOLIO_CONFIG__`.
   - Sostituisci ogni array `images` con gli **ID** nello stesso ordine dei file locali, oppure oggetti `{ driveId: "...", file: "nome.webp" }` per un `alt` leggibile.

La griglia usa le **miniature** (`thumbnail?id=…&sz=w1200`) per alleggerire il carico; lo **zoom** usa `uc?export=view&id=…` (qualità piena). Puoi disattivare le miniature con `useThumbnailsInGrid: false`.

**Limiti:** Drive non è una CDN: con molte immagini puoi avere **più latenza** o limiti rispetto ai file in `media/`. Per un sito molto visitato conviene uno storage pensato per il web (es. Cloudflare R2, S3, Cloudinary). Se un’immagine non si vede, verifica condivisione e che non sia solo “Utenti con link” senza accesso in lettura.

Opzionale: sovrascrivi gli URL con `driveUrlTemplate` e `driveThumbnailTemplate` in `__PORTFOLIO_CONFIG__` (usa il segnaposto `{id}`).

### Cartella Drive unica (stessa struttura delle cartelle locali)

Se le foto sono nella cartella condivisa del portfolio ([link esempio](https://drive.google.com/drive/folders/1U62jXXhkW0K6bGWlO75GUxEQWRf_N0Ay?usp=sharing)), il link della **cartella** non basta per le `<img>`: servono gli **ID dei file**. Il modo più semplice è usare il manifest generato da **Google Apps Script**:

1. Segui **`tools/DRIVE-MANIFEST.md`** e incolla lo script da **`tools/google-apps-script-drive-manifest.js`** in un nuovo progetto Apps Script.
2. Pubblica come **App web** (accesso *Chiunque*) e copia l’URL che finisce con **`/exec`**.
3. In `portfolio/portfolio-config.js` imposta `driveManifestUrl: "https://script.google.com/macros/s/.../exec"`.

All’avvio il sito carica il JSON con tutti i `driveId` e passa in modalità Drive automaticamente. Se lasci `driveManifestUrl` vuoto, restano le immagini in `media/projects/`.

## CSS monolitico → tre file

Per rigenerare `style-shared.css` / `style-mobile.css` / `style-desktop.css` da un unico foglio: salva il CSS completo come `style.monolith.css` nella root ed esegui `node tools/split-styles.mjs` (oppure `node tools/split-styles.mjs percorso/file.css`).

## Progetti modulari

- **`node tools/emit-portfolio-projects.mjs`** — rigenera tutti i `portfolio/projects/<categoria>/<id>/data.js` dall’array nello script (utile dopo modifiche bulk). Se editi a mano un solo `data.js`, non rilanciare il tool senza aggiornare l’array nello script.
