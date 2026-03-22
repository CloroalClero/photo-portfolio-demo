/**
 * Google Apps Script — manifest portfolio da Drive
 *
 * 1. Vai su https://script.google.com → Nuovo progetto
 * 2. Incolla tutto questo file come contenuto di Code.gs
 * 3. Salva, poi Distribuisci → Distribuzione → Nuova distribuzione
 *    Tipo: App web
 *    Esegui come: Me
 *    Chi ha accesso: Chiunque
 * 4. Copia l’URL che termina con /exec e incollalo in portfolio/portfolio-config.js → driveManifestUrl
 *
 * Cartella radice (stessa struttura delle cartelle locali):
 * https://drive.google.com/drive/folders/1U62jXXhkW0K6bGWlO75GUxEQWRf_N0Ay
 */
var ROOT_FOLDER_ID = "1U62jXXhkW0K6bGWlO75GUxEQWRf_N0Ay";

/* Ordine = N.1 … N.14 nel sito (match = nome cartella su Drive). */
var PROJECT_META = [
  { match: "Florentina", id: "florentina", folder: "Florentina", title: "FLORENTINA" },
  { match: "Binge-drinking", id: "binge-drinking", folder: "Binge-drinking", title: "BINGE DRINKING" },
  { match: "Nude", id: "nude", folder: "Nude", title: "NUDE" },
  { match: "L'isola", id: "l-isola", folder: "L'isola", title: "L'ISOLA" },
  { match: "parigi", id: "parigi", folder: "parigi", title: "Parigi" },
  { match: "taboo-shooting", id: "taboo-shooting", folder: "taboo-shooting", title: "Taboo Shooting" },
  { match: "Moda-shooting", id: "moda-shooting", folder: "Moda-shooting", title: "Moda Shooting" },
  { match: "Moda_jump", id: "moda-jump", folder: "Moda_jump", title: "Moda Jump" },
  { match: "Gallipoli-day", id: "gallipoli-day", folder: "Gallipoli-day", title: "Gallipoli – Giorno" },
  { match: "Gallipoli-night", id: "gallipoli-night", folder: "Gallipoli-night", title: "Gallipoli - Notte" },
  { match: "DJ-set", id: "dj-set", folder: "DJ-set", title: "DJSET" },
  { match: "concerti-ernia", id: "concerti-ernia", folder: "concerti-ernia", title: "Concerti – Ernia" },
  { match: "Laurea-ame", id: "laurea-ame", folder: "Laurea-ame", title: "Laurea – Ame" },
  { match: "Anca-edward", id: "anca-edward", folder: "Anca-edward", title: "ANCA & EDWARD" }
];

function doGet() {
  var root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  var byName = {};
  var subfolders = root.getFolders();
  while (subfolders.hasNext()) {
    var sf = subfolders.next();
    byName[sf.getName()] = sf;
  }

  var projects = [];
  for (var i = 0; i < PROJECT_META.length; i++) {
    var meta = PROJECT_META[i];
    var sub = byName[meta.match];
    if (!sub) continue;

    var images = [];
    var files = sub.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      if (file.getMimeType().indexOf("image/") === 0) {
        images.push({ name: file.getName(), id: file.getId() });
      }
    }
    images.sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });

    projects.push({
      id: meta.id,
      folder: meta.folder,
      title: meta.title,
      images: images.map(function (img) {
        return { driveId: img.id, file: img.name };
      })
    });
  }

  var payload = {
    config: { imagesFrom: "drive", useThumbnailsInGrid: true },
    projects: projects
  };
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
