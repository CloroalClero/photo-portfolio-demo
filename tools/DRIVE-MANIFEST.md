# Collegare il portfolio alla cartella Google Drive

La cartella condivisa ([portfolio rubina sito](https://drive.google.com/drive/folders/1U62jXXhkW0K6bGWlO75GUxEQWRf_N0Ay?usp=sharing)) ha solo l’**ID della cartella**. Per mostrare le immagini nel sito servono gli **ID di ogni file** (non si può usare solo il link della cartella nelle `<img>`).

## Metodo consigliato: Google Apps Script (gratuito)

1. Apri [script.google.com](https://script.google.com) e crea un **nuovo progetto**.
2. Cancella il codice predefinito e incolla il contenuto di **`google-apps-script-drive-manifest.js`** (stessa cartella `tools/`).
3. **Salva** il progetto (nome a piacere).
4. **Distribuisci** → **Distribuzione** → **Nuova distribuzione** → tipo **App web**:
   - Esegui come: **Io**
   - Chi ha accesso: **Chiunque** (o “Chiunque su Internet”)
5. Copia l’**URL** che termina con **`/exec`** (non `/dev`).
6. In `portfolio/portfolio-config.js` imposta:
   ```js
   driveManifestUrl: "https://script.google.com/macros/s/XXXX/exec"
   ```
   (l’URL completo che hai copiato).

Il sito, all’avvio, scarica il JSON con tutti i `driveId` e imposta `imagesFrom: "drive"` automaticamente dal manifest.

### Griglia Drive + zoom da file locali (`media/`)

Se nel manifest ogni immagine include anche il nome file (`images: [{ driveId, file: "nome.webp" }, …]`, come nello script in `tools/`), puoi lasciare **`useLocalMediaForZoom: true`** in `portfolio-config.js`: la griglia usa le miniature Drive, lo zoom fullscreen carica **`media/projects/<folder progetto>/<stesso nome file>`** dal sito. In deploy vanno quindi pubblicate le cartelle `media/projects/...` con gli originali allineati ai nomi del manifest.

### Permessi

La prima esecuzione chiederà l’autorizzazione a leggere i file su Drive: accetta con l’account che **possiede** la cartella (o che ha accesso in lettura alle sottocartelle).

### Nomi cartelle su Drive

Devono coincidere con quelli in `PROJECT_META` nello script (es. `Moda_jump`, `L'isola`). Se rinomini una cartella su Drive, aggiorna anche la riga corrispondente nello script (`match`).

---

## Se il fetch dal browser fallisce (CORS / redirect)

Alcuni browser bloccano `fetch` verso `script.google.com`. In quel caso:

- prova da un dominio reale (non `file://`), oppure
- esegui `doGet` dall’editor Apps Script (icona Esegui), apri **Visualizza → Log** e non è ideale per il JSON; meglio usare **Distribuzione** app web e testare l’URL in una nuova scheda: deve comparire solo JSON.

Se serve, si può usare il JSON del manifest come sorgente e aggiornare i singoli `portfolio/projects/<categoria>/<id>/data.js`, con `imagesFrom: "drive"` in config.
