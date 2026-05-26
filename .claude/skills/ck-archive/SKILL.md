---
name: ck-archive
description: >
  Project context for the Calvin Klein Print Archive repo. Load this at the START of
  any session working on this repo, and whenever the task is: adding images/videos to the
  index, editing the databases (CSV / Excel / archive_dims.js), or changing layout, menu,
  animations or styles. Explains DB structure + update workflow, required Python tools to
  install, where the UI/layout/animation code lives, and the rule that the 3 branches
  (main_ale, claude, main_costa) must always match.
---

# Calvin Klein Print Archive — project context

A static website (no build step) that displays an archive of Calvin Klein advertising and
editorial images/videos with metadata. Open `index.html` in a browser to run it.

## Data flow (how the site reads the databases)

`index.html` loads, in order: GSAP (animation lib, via CDN) → `archive_dims.js` → `script.js`.
`style.css` is the stylesheet.

- `script.js` `fetch()`es **`archive_index.csv`** (~line 913), splits by line, the first line is
  the header, each later line is `split(',')` into a per-image object keyed by the header.
- Image/video pixel dimensions come from the global `ARCHIVE_DIMS` defined in **`archive_dims.js`**.
- Files are served from `assets/index/...`; the `filename` column has **no extension** — the
  extension is taken from `ARCHIVE_DIMS` (`"jpg"`/`"mp4"`/omitted = `webp`).

## The three databases (must always stay in sync)

All three describe the same set of images/videos and must contain the same entries.

1. **`archive_index.csv`** — source of truth. 24 columns, comma-separated, no quoting:
   `filename,year,season,category,subcategory,description,campaign,photographer,director,producer,production_company,model,stylist,art_director,creative_director,hair,makeup,set_designer,casting_director,agency,publication,issue_date,music,notes`
   Most metadata columns are empty; only the first ~6 are derived from the filename.
   Ordering: grouped into sorted sections — `adv_print` (sorted by filename), then `edi`,
   then `adv_tv`, then `adv_billboard` (sorted). New rows go into their section in sorted
   position. (A few stray rows may sit at the end from past appends — leave them.)

2. **`archive_index.xlsx`** — sheet name `archive`, mirrors the CSV exactly (same rows, same
   order, 24 columns). Regenerate it from the CSV (don't hand-edit) so it can never drift.

3. **`archive_dims.js`** — `const ARCHIVE_DIMS = { "filename_without_ext": [w,h] , ... }`.
   `[w,h]` for `.webp`, `[w,h,"jpg"]` for other images, `[w,h,"mp4"]` for videos.
   **Auto-generated** — never edit by hand. Run `python3 generate_dims.py` (scans
   `assets/index/**`).

## Tools to install (fresh web-session container has none of these)

```
pip install Pillow openpyxl pymediainfo
```

- **Pillow** (PIL): image dimensions for `generate_dims.py`.
- **openpyxl**: read/write `archive_index.xlsx`.
- **pymediainfo**: video (`.mp4`) dimensions for `generate_dims.py` (the `libmediainfo`
  system lib is already present in this environment). Without it, `generate_dims.py`
  silently skips videos and drops the `adv_tv` entries — so install it before regenerating.

## Naming convention (see `naming_convention.md` for the full category/testata lists)

Filenames (without extension) parse into the DB columns:

- ADV print:     `YYYY_[ss|fw]_adv_print_CATEGORY[_SUBCATEGORY]_NNN`
- ADV billboard: `YYYY_[ss|fw]_adv_billboard_CATEGORY[_SUB]_NNN`
- ADV tv (video):`YYYY_adv_tv_NAME_NNN`   (no season)
- EDI:           `YYYY_edi_TESTATA_NNN`    (no season)

Parse rule: `year` = first token; `season` = `ss`/`fw` if present else empty; `category` =
`adv`/`edi`; `subcategory` = `print`/`billboard`/`tv` (empty for edi); `description` = the
first token after the subcategory; `campaign` = any remaining tokens (before the trailing
`NNN`) joined with `_`. All other columns stay empty unless real metadata is known.

## Workflow: adding new images/videos to the index

1. Confirm files are under `assets/index/<adv|edi>/<print|billboard|tv>/YYYY/` and follow the
   naming convention. **Rename any non-conforming files** (e.g. `GettyImages-1234.webp`) first
   — view the image to infer year/season/category, and ask the user if unsure.
2. Diff disk vs CSV to find new entries: compare image stems under `assets/index` against
   column 1 of `archive_index.csv`.
3. For each new file, build a 24-column row using the parse rule and insert it into the
   correct CSV section in sorted position.
4. Regenerate `archive_index.xlsx` from the updated CSV with openpyxl (sheet `archive`,
   write empty strings as blank cells).
5. Run `python3 generate_dims.py` to regenerate `archive_dims.js`.
6. **Verify**: CSV filename set == XLSX filename set (same order); every image-backed CSV row
   has an `ARCHIVE_DIMS` entry. (Note: a CSV row whose file isn't on disk will have no dims
   entry — that's a pre-existing data gap, not a regression.)
7. Open `index.html` in a browser to confirm the new years/items appear with correct images.

## Where the UI lives (layout, menu, animations, styles)

- **`index.html`** — page markup/structure (menu, archive, people, search containers).
- **`style.css`** — all styling and CSS animation. Menu styles start ~`.menu` (line ~151).
  CSS `@keyframes`: `flashIn`/`flashOut`, `orbitIn`/`orbitOut`, `searchFall`; many
  `transition:`/`animation:` rules. Edit here for layout (grid, gutters, spacing), menu look,
  and pure-CSS animation timing/easing.
- **`script.js`** — behavior + JS-driven animation (uses **GSAP**). Key spots: `play()` intro
  sequence (~132), menu hover handlers (~349), orbit (`buildOrbitSlots`/`runOrbitRotation`
  ~407), people transition (~479), search transitions (~559–854), CSV loader (~913).
  Edit here for interaction logic and GSAP timelines/sequencing.
- **`figma_data.json`** — design reference. `assets/` (logo, `calvinklein_intro.mp3`,
  search background) and `fonts/` hold static assets.

When changing a menu layout or an animation: check `style.css` first (CSS keyframes/
transitions); if the motion is scripted, it's a GSAP timeline in `script.js`.

## Branch policy — ALL THREE BRANCHES MUST ALWAYS MATCH

Target branches (keep all at the same commit after every change):
- **`main_ale`** — the default branch
- **`claude`**
- **`main_costa`**

Rules:
- After any change, push so all three point to the same commit.
- `main_ale` and `claude` usually fast-forward. `main_costa` has diverged in the past and may
  need a **merge** to bring changes in.
- **Always inform the user** before/when a merge is required, when the branches differ, or
  when files conflict — don't silently resolve a non-trivial merge.
- Gotcha: the remote has a branch literally named `claude`, which blocks any local branch
  named `claude/...` from being pushed (git directory/file conflict). Push to the three target
  branches directly (`git push origin <localref>:claude`, etc.); ignore the stop-hook warning
  about the `claude/...` dev branch being "unpushed" — the commits are on the target branches.
- `.gitignore` excludes `Thumbs.db` and `.DS_Store`; don't re-add those.
