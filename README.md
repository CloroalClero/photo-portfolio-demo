# Portfolio — Rubina

Galleria drag & zoom basata su [questo Pen GSAP](https://codepen.io/filipz/pen/dPGKGOo).

## Struttura del repo

Il **sito pubblicabile** sta nella **root** del progetto: `index.html`, `style.css`, `script.js`, `portfolio-data.js` e la cartella `media/` (stesso livello). Non c’è più una cartella `dist/` — così puoi pubblicare la root del repo (o zip di quei file) così com’è.

La cartella `src/` contiene gli stessi sorgenti JS/CSS/dati (e frammenti HTML) per lavorare in editor: quando modifichi lì, **copia i file aggiornati nella root** se vuoi allineare il deploy.

## Contenuti e progetti

Le immagini vivono in `media/projects/` (una cartella per progetto). L’elenco file è in `portfolio-data.js` (`window.__PORTFOLIO_PROJECTS__`).

- Per **aggiornare le foto**: copia le cartelle da `Foto-portfolio/Foto-portfolio/` dentro `media/projects/` (stessi nomi cartella), poi rigenera `portfolio-data.js` se aggiungi o rimuovi file (oppure modifica l’array a mano).
- **Anteprima**: dalla root del repo, `npx serve .` (oppure apri `index.html` tramite un server locale) così percorsi e script restano coerenti.

### Deploy e cartelle

Le foto **devono** stare in sottocartelle (`media/projects/NomeProgetto/…`): non è quello che rompe il deploy. Quello che conta è **cosa carichi sul server**:

1. **Struttura consigliata**: pubblica **index.html**, `style.css`, `script.js`, `portfolio-data.js` e l’intera cartella `media/` nella root del sito.
2. **GitHub Pages (repo `username.github.io/nome-repo`)**: se la root del sito è `https://…github.io/nome-repo/`, i percorsi relativi `media/projects/…` funzionano **purché** `media` sia nella stessa pubblicazione (non solo `index.html`).
3. **Sito in una sottocartella diversa da dove sono le immagini**: in `portfolio-data.js` imposta `basePath` in `__PORTFOLIO_CONFIG__`, ad esempio `basePath: "/percorso/pubblico/"` (slash iniziale e finale consigliati), oppure definisci `window.__PORTFOLIO_BASE_PATH__` prima di caricare `script.js`.
4. **File aperti con `file://`**: manifest Drive e alcuni asset possono fallire; usa sempre un piccolo server HTTP in locale per provare.

Nel menu **Progetti** puoi filtrare la griglia per serie; **Tutti** (o il logo) mostra l’intero catalogo.

## Immagini da Google Drive

Sì, è possibile: il sito costruisce gli URL con l’**ID file** di Drive (non il link “Apri in Drive” così com’è).

1. Carica le foto su Drive (stesso ordine che usi in `portfolio-data.js` per ogni progetto).
2. Per ogni file: **Condividi** → accesso **Chiunque abbia il link** → **Visualizzatore**.
3. Dal link `https://drive.google.com/file/d/QUESTO_È_L_ID/view` copia solo l’ID (la lunga stringa tra `/d/` e `/view`).
4. In `portfolio-data.js` imposta:
   - `imagesFrom: "drive"` dentro `__PORTFOLIO_CONFIG__`.
   - Sostituisci ogni array `images` con gli **ID** nello stesso ordine dei file locali, oppure oggetti `{ driveId: "...", file: "nome.jpg" }` per un `alt` leggibile.

La griglia usa le **miniature** (`thumbnail?id=…&sz=w1200`) per alleggerire il carico; lo **zoom** usa `uc?export=view&id=…` (qualità piena). Puoi disattivare le miniature con `useThumbnailsInGrid: false`.

**Limiti:** Drive non è una CDN: con molte immagini puoi avere **più latenza** o limiti rispetto ai file in `media/`. Per un sito molto visitato conviene uno storage pensato per il web (es. Cloudflare R2, S3, Cloudinary). Se un’immagine non si vede, verifica condivisione e che non sia solo “Utenti con link” senza accesso in lettura.

Opzionale: sovrascrivi gli URL con `driveUrlTemplate` e `driveThumbnailTemplate` in `__PORTFOLIO_CONFIG__` (usa il segnaposto `{id}`).

### Cartella Drive unica (stessa struttura delle cartelle locali)

Se le foto sono nella cartella condivisa del portfolio ([link esempio](https://drive.google.com/drive/folders/1U62jXXhkW0K6bGWlO75GUxEQWRf_N0Ay?usp=sharing)), il link della **cartella** non basta per le `<img>`: servono gli **ID dei file**. Il modo più semplice è usare il manifest generato da **Google Apps Script**:

1. Segui **`tools/DRIVE-MANIFEST.md`** e incolla lo script da **`tools/google-apps-script-drive-manifest.js`** in un nuovo progetto Apps Script.
2. Pubblica come **App web** (accesso *Chiunque*) e copia l’URL che finisce con **`/exec`**.
3. In `portfolio-data.js` imposta `driveManifestUrl: "https://script.google.com/macros/s/.../exec"`.

All’avvio il sito carica il JSON con tutti i `driveId` e passa in modalità Drive automaticamente. Se lasci `driveManifestUrl` vuoto, restano le immagini in `media/projects/`.
