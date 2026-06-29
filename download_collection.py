#!/usr/bin/env python3
"""
download_collection.py
Scarica le foto di una sfilata da firstview.com, le ordina in
  assets/index/collection/<anno>/<anno>_<ss|fw>_collection_<NNN>.jpg
e aggiorna i tre database (archive_index.csv, archive_index.xlsx, archive_dims.js).

Uso:
    python3 download_collection.py "https://firstview.com/collection_images.php?id=54760"
    python3 download_collection.py URL --year 2003 --season ss   # forza i metadati
    python3 download_collection.py URL --no-db                   # solo file, niente database
    python3 download_collection.py URL --dry-run                 # mostra cosa farebbe, non scarica

Note:
 - Nella pagina i thumbnail sono "thumb_XXXX.jpg"; la versione full e' lo stesso
   nome senza il prefisso "thumb_" (es. thumb_8725696-...jpg -> 8725696-...jpg).
 - E' idempotente: le foto gia' registrate (vedi colonna notes "firstview:<id>")
   vengono saltate, cosi' rilanciarlo non crea doppioni.
 - Dipendenze per l'aggiornamento DB: pip install Pillow openpyxl pymediainfo
"""
import argparse
import re
import sys
import csv
import subprocess
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

REPO = Path(__file__).resolve().parent
INDEX_DIR = REPO / "assets" / "index"
COLLECTION_DIR = INDEX_DIR / "collection"
CSV_PATH = REPO / "archive_index.csv"
XLSX_PATH = REPO / "archive_index.xlsx"
DIMS_SCRIPT = REPO / "generate_dims.py"

# 24 colonne, stesso ordine dell'header di archive_index.csv
CSV_COLUMNS = [
    "filename", "year", "season", "category", "subcategory", "description",
    "campaign", "photographer", "director", "producer", "production_company",
    "model", "stylist", "art_director", "creative_director", "hair", "makeup",
    "set_designer", "casting_director", "agency", "publication", "issue_date",
    "music", "notes",
]

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


# ---------------------------------------------------------------- rete --------
def fetch(url, binary=False):
    req = Request(url, headers={"User-Agent": UA, "Referer": "https://firstview.com/"})
    with urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


# ------------------------------------------------------ parsing della pagina --
def page_title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""


def detect_year(html):
    """Anno: prima dal <title>, poi dal resto della pagina."""
    for text in (page_title(html), html):
        m = re.search(r"\b(19[7-9]\d|20[0-4]\d)\b", text)
        if m:
            return m.group(1)
    return None


def detect_season(html):
    """fw = fall/autumn/pre-fall ; ss = spring/summer/resort/cruise."""
    for text in (page_title(html), html):
        t = text.lower()
        if re.search(r"\b(fall|autumn|pre[\s-]?fall|winter|f/?w)\b", t):
            return "fw"
        if re.search(r"\b(spring|summer|resort|cruise|s/?s)\b", t):
            return "ss"
    return None


def extract_full_urls(html, page_url):
    """Trova tutti i thumbnail (thumb_*.jpg), li assolutizza e restituisce le URL
    full (senza 'thumb_'), deduplicate mantenendo l'ordine di pagina."""
    best, order = {}, []  # source_id -> (rank, full_url) ; rank=1 se URL assoluta
    for m in re.finditer(r"[^\s\"'()<>]+thumb_[A-Za-z0-9._-]+\.jpe?g", html, re.I):
        raw = m.group(0)
        full_url = urljoin(page_url, raw)
        base = full_url.rsplit("/", 1)
        if len(base) != 2:
            continue
        full_name = re.sub(r"^thumb_", "", base[1], flags=re.I)
        full = base[0] + "/" + full_name
        source_id = re.sub(r"\.jpe?g$", "", full_name, flags=re.I)  # es. 8725696-6560b9002c62a
        rank = 1 if re.match(r"https?://", raw, re.I) else 0
        if source_id not in best:
            order.append(source_id)
            best[source_id] = (rank, full)
        elif rank > best[source_id][0]:
            best[source_id] = (rank, full)  # preferisci URL assolute alle relative
    return [(sid, best[sid][1]) for sid in order]


# ----------------------------------------------------------------- CSV --------
def read_csv_rows():
    if not CSV_PATH.exists():
        sys.exit(f"ERRORE: non trovo {CSV_PATH}")
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = [r for r in reader if r]  # salta righe vuote
    if header != CSV_COLUMNS:
        sys.exit("ERRORE: l'header del CSV non corrisponde alle 24 colonne attese.")
    return rows


def existing_sources(rows):
    """Set degli id firstview gia' presenti (colonna notes = 'firstview:<id>')."""
    notes_i = CSV_COLUMNS.index("notes")
    src = set()
    for r in rows:
        if len(r) > notes_i:
            m = re.search(r"firstview:(\S+)", r[notes_i])
            if m:
                src.add(m.group(1))
    return src


def build_row(filename, year, season, source_id):
    row = [""] * len(CSV_COLUMNS)
    row[CSV_COLUMNS.index("filename")] = filename
    row[CSV_COLUMNS.index("year")] = year
    row[CSV_COLUMNS.index("season")] = season
    row[CSV_COLUMNS.index("category")] = "collection"
    row[CSV_COLUMNS.index("notes")] = f"firstview:{source_id}"
    return row


def write_csv(rows):
    """Riscrive il CSV con QUOTE_MINIMAL. Le righe 'collection' vanno in coda,
    ordinate per filename, senza toccare l'ordine delle sezioni esistenti."""
    cat_i = CSV_COLUMNS.index("category")
    fn_i = CSV_COLUMNS.index("filename")
    others = [r for r in rows if (r[cat_i] if len(r) > cat_i else "") != "collection"]
    coll = [r for r in rows if (r[cat_i] if len(r) > cat_i else "") == "collection"]
    coll.sort(key=lambda r: r[fn_i])
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        w.writerow(CSV_COLUMNS)
        w.writerows(others + coll)


def regenerate_xlsx():
    try:
        from openpyxl import Workbook
    except ImportError:
        print("  ! openpyxl non installato: salto archive_index.xlsx "
              "(pip install openpyxl)")
        return
    rows = read_csv_rows()
    wb = Workbook()
    ws = wb.active
    ws.title = "archive"
    ws.append(CSV_COLUMNS)
    for r in rows:
        ws.append([(c if c != "" else None) for c in r])
    wb.save(XLSX_PATH)
    print(f"  + rigenerato {XLSX_PATH.name}")


def regenerate_dims():
    if not DIMS_SCRIPT.exists():
        print("  ! generate_dims.py non trovato: salto archive_dims.js")
        return
    print("  > python3 generate_dims.py")
    res = subprocess.run([sys.executable, str(DIMS_SCRIPT)], cwd=str(REPO))
    if res.returncode != 0:
        print("  ! generate_dims.py ha restituito un errore "
              "(serve: pip install Pillow pymediainfo)")


# ----------------------------------------------------------------- main -------
def main():
    ap = argparse.ArgumentParser(description="Scarica e ordina le foto sfilata da firstview.com")
    ap.add_argument("url", help="URL della pagina collection_images.php?id=...")
    ap.add_argument("--year", help="Forza l'anno (es. 2003)")
    ap.add_argument("--season", choices=["ss", "fw"], help="Forza la stagione")
    ap.add_argument("--no-db", action="store_true", help="Aggiorna solo i file, non i database")
    ap.add_argument("--dry-run", action="store_true", help="Mostra cosa farebbe senza scaricare")
    ap.add_argument("--force-designer", action="store_true",
                    help="Procedi anche se 'Calvin Klein' non e' nella pagina")
    args = ap.parse_args()

    print(f"Pagina: {args.url}")
    try:
        html = fetch(args.url)
    except (URLError, HTTPError) as e:
        sys.exit(f"ERRORE rete: {e}\n(Se sei dietro un proxy che blocca firstview.com, "
                 "lancia lo script da una rete che lo permette.)")

    title = page_title(html)
    if title:
        print(f"Titolo:  {title}")

    if not args.force_designer and "calvin klein" not in html.lower():
        sys.exit("ERRORE: 'Calvin Klein' non trovato nella pagina. "
                 "Se e' giusta comunque, rilancia con --force-designer.")

    year = args.year or detect_year(html)
    season = args.season or detect_season(html)
    if not year:
        sys.exit("ERRORE: anno non rilevato. Passa --year YYYY.")
    if not season:
        sys.exit("ERRORE: stagione non rilevata. Passa --season ss|fw.")
    print(f"Anno: {year}   Stagione: {season}")

    images = extract_full_urls(html, args.url)
    if not images:
        sys.exit("ERRORE: nessun thumbnail 'thumb_*.jpg' trovato nella pagina.")
    print(f"Trovate {len(images)} foto.")

    # idempotenza: salta gli id firstview gia' nel CSV
    csv_rows = [] if args.no_db else read_csv_rows()
    already = set() if args.no_db else existing_sources(csv_rows)

    dest = COLLECTION_DIR / year
    # prossimo progressivo libero per questo anno+stagione
    pat = re.compile(rf"^{year}_{season}_collection_(\d+)\.jpg$")
    used = [int(pat.match(p.name).group(1)) for p in dest.glob("*.jpg")
            if pat.match(p.name)] if dest.exists() else []
    next_n = max(used) + 1 if used else 1

    new_rows, downloaded, skipped = [], 0, 0
    for source_id, full_url in images:
        if source_id in already:
            skipped += 1
            continue
        stem = f"{year}_{season}_collection_{next_n:03d}"
        target = dest / f"{stem}.jpg"
        if args.dry_run:
            print(f"  [dry-run] {full_url}  ->  collection/{year}/{stem}.jpg")
            next_n += 1
            continue
        dest.mkdir(parents=True, exist_ok=True)
        try:
            target.write_bytes(fetch(full_url, binary=True))
        except (URLError, HTTPError) as e:
            print(f"  ! errore su {full_url}: {e}")
            continue
        print(f"  + {stem}.jpg")
        new_rows.append(build_row(stem, year, season, source_id))
        downloaded += 1
        next_n += 1

    print(f"\nScaricate {downloaded}, saltate {skipped} (gia' presenti).")
    if args.dry_run:
        print("dry-run: nessun file scritto, nessun database aggiornato.")
        return

    if args.no_db:
        print("--no-db: file scaricati, database non aggiornati.")
        return
    if not new_rows:
        print("Niente di nuovo da aggiungere ai database.")
        return

    write_csv(csv_rows + new_rows)
    print(f"  + aggiunte {len(new_rows)} righe a {CSV_PATH.name}")
    regenerate_xlsx()
    regenerate_dims()
    print("\nFatto. Apri index.html e controlla la sezione 'collections'.")


if __name__ == "__main__":
    main()
