# Progetti (root dedicate)

Le serie sono raggruppate per **categoria** (come nel menu Progetti), con slug di cartella stabili:

| Cartella categoria       | Contenuto (esempi)      |
|--------------------------|---------------------------|
| `ricerca-personale/`     | FLORENTINA, NUDE, PARIS, … |
| `fotografia-di-moda/`    | FASHION, JUMP             |
| `fotografia-di-eventi/`  | byDAY, CONCERTI, …        |
| `fotografia-maternity/`  | ANCA & EDWARD             |

Ogni serie ha una cartella **`portfolio/projects/<categoria>/<id>/`** (lo `id` coincide con `id` nel menu e nei dati).

- **`data.js`** — definizione del progetto (titolo, cartella `media/`, immagini, `layout`, `summary`, …). Viene caricato prima di `projects-registry.js`.
  - **`layout`** — opzionale: `concept` (Anca & Edward), `horizontal-mixed` (NUDE), **`editorial`** (pagina con titolo grande + testo + galleria ai lati / sotto su mobile).
  - **`summary`** — testo mostrato nella vista serie (blurb griglia / intestazioni). Se vuoto, si può usare **`blurb`** come ripiego breve. Due a capo consecutivi nel testo creano paragrafi separati (`<p>`).
  - **`blurbSpanRows`** *(opzionale, numero ≥ 2)* — altezza in celle della fascia testo in vista progetto (default 2); utile per testi lunghi su desktop.
- **`mobile.css`** *(opzionale)* — stili solo su mobile quando quella serie è attiva. Caricato automaticamente da `script-shared.js` tramite `__PORTFOLIO_PROJECT_PATH_BY_ID__` (404 se assente: nessun problema).

Immagini restano in **`media/projects/<NomeCartella>/`** come prima (`folder` in `data.js`).

### Prestazioni (immagini locali)

Il browser **decodifica l’intero JPEG** anche se la cella in griglia è piccola: file da 20–40 MP causano **lag**, **RAM alta** e scroll a scatti.

- Esporta per il web (lato lungo indicativamente **1600–2200 px**, qualità ~75–82) oppure tieni gli originali ma aggiungi **miniature** usate solo in griglia / editoriale:
  - In **`portfolio/portfolio-config.js`**, imposta `localThumbnailSubfolder: "thumbs"` e crea `media/projects/<NomeCartella>/thumbs/` con **gli stessi nomi file** dell’array `images` (JPEG leggeri). Lo **zoom** continuerà a usare i file nella cartella principale (`fullImageUrl`).
  - In alternativa, in `data.js`: `images: [{ file: "01.jpg", thumb: "previews/01.jpg" }, …]`.
- **`gridImageEagerCount`** (default `14`): solo le prime N celle foto usano `loading="eager"`, le altre `lazy`, per non avviare decine di caricamenti insieme.

Per **nuovo progetto**:

1. Scegli la categoria e crea `portfolio/projects/<categoria>/<id>/data.js` (vedi un esistente nella stessa categoria).
2. Inserisci `<script defer src="portfolio/projects/<categoria>/<id>/data.js"></script>` in `index.html` **prima** di `projects-registry.js`.
3. Aggiungi `"<id>"` nell’array `ORDER` in `projects-registry.js` nella posizione del menu (definisce **N.1, N.2, …** in griglia, menu e blurbs tramite `__PORTFOLIO_PROJECT_ORDINAL_BY_ID__`).
4. Aggiorna `__PORTFOLIO_MENU_SECTIONS__` nello stesso file: stessa categoria → stesso `folder` (slug) e aggiungi l’`id` nell’array `ids` della sezione giusta. Da lì si aggiorna anche `__PORTFOLIO_PROJECT_PATH_BY_ID__` per `mobile.css`.
