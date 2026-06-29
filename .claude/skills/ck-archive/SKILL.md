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

- `script.js` `fetch()`es **`archive_index.csv`** (`loadArchiveManifest`), splits by line, the
  first line is the header, each later line is parsed by **`parseCsvLine`** (a quote-aware
  parser) into a per-image object keyed by the header. Use `parseCsvLine`, not `split(',')`,
  because some fields are double-quoted (see CSV quoting note below).
- Image/video pixel dimensions come from the global `ARCHIVE_DIMS` defined in **`archive_dims.js`**.
- Files are served from `assets/index/...`; the `filename` column has **no extension** — the
  extension is taken from `ARCHIVE_DIMS` (`"jpg"`/`"mp4"`/omitted = `webp`).
- `normalize(s)` (display + search helper) maps `_` **and `-`** to spaces, so a `model` value
  like `kate-moss` (hyphen joins first+last name) reads/searches as `kate moss`.

## The three databases (must always stay in sync)

All three describe the same set of images/videos and must contain the same entries.

1. **`archive_index.csv`** — source of truth. 24 columns, comma-separated, **minimal quoting**
   (write with `csv.QUOTE_MINIMAL`):
   `filename,year,season,category,subcategory,description,campaign,photographer,director,producer,production_company,model,stylist,art_director,creative_director,hair,makeup,set_designer,casting_director,agency,publication,issue_date,music,notes`
   Most metadata columns are empty; only the first ~6 are derived from the filename.
   **`model`** holds one or more people; multiple models are **comma-separated inside the cell**
   and each name uses a hyphen between first+last (e.g. `kate-moss,amber-valletta`). Because the
   comma would break a bare CSV split, any cell containing a comma is **double-quoted** — so the
   JS loader uses `parseCsvLine` and CSV writers must quote. Ordering: grouped into sorted
   sections — `adv_print` (by filename), then `edi`, then `adv_tv`, then `adv_billboard`. New
   rows go into their section in sorted position. (A few stray rows may sit at the end — leave
   them.)

2. **`archive_index.xlsx`** — sheet name `archive`, mirrors the CSV exactly (same rows, same
   order, 24 columns). Regenerate it from the CSV (don't hand-edit) so it can never drift.
   **If the user hand-edits the xlsx** (e.g. fills `model`), sync it INTO the CSV: read the
   xlsx, write the CSV with `QUOTE_MINIMAL`, then regenerate the xlsx from that CSV so the two
   match. (Watch for values entered in the wrong adjacent column, e.g. a model name landing in
   `production_company`.)

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

- **`index.html`** — page markup/structure: `#stage` (intro), `.menu` (+ archive-mode primary
  `.menu-primary-archive` whose first item `#archive-show-all` doubles as the scope label),
  `#archive-stage` (infinite canvas + `#archive-list` list view + `#list-view-btn`),
  `#item-view`, `#people-stage` (`.people-list` → `.people-list-inner` of `.people-entry`s),
  `#person-stage` (video page), `#timeline-stage`, `#search-stage`, mobile overlay.
  `<head>` sets the **favicon** to `assets/favicon_monogram_white.svg` (white monogram, for
  GitHub Pages). There is **no `profile`** menu item (removed, desktop + mobile + search data).
- **`style.css`** — all styling and CSS animation. Menu ~`.menu`. CSS `@keyframes`:
  `flashIn`/`flashOut`, `orbitIn`/`orbitOut` (orbit now unused), `searchFall`. Edit here for
  layout/spacing, menu look, pure-CSS timing/easing.
- **`script.js`** — behavior + JS-driven animation (uses **GSAP**), all inside one
  `DOMContentLoaded`. Reference by function name (line numbers drift):
  - intro `play()` / `skipToLogo()`; CSV `loadArchiveManifest` + `parseCsvLine`.
  - **Archive infinite canvas**: virtualized masonry (`buildItems`/`syncMounted`), drag +
    wheel inertia, `setCategory`, `applyArchiveFilter`, `filterByQuery` (searches **all** csv
    fields), `filterImages` (respects `archiveScope`), list view (`openListView` respects the
    active `currentSearchQuery`/scope), `openItemView`/`openItemViewFromList`/`closeItemView`
    (`closeItemView(onDone)` takes an optional callback).
  - **Item-view fields are clickable** (`renderItemMeta` → `metaValueEl`, `.iv-link`): every
    populated credit (year/model/photographer/…) calls `jumpToArchiveQuery(query, label)`,
    which scopes the canvas to that field, sets the menu's first item to the clicked label, and
    **pushes the prior context onto `archiveCtxStack`**. The archive back button
    (`archiveBackStep`) pops one level — restoring that canvas (scope/category/search) and
    reopening the exact item with an Adobe-Flash zoom — so a single back returns to the previous
    item. `model` may be multi-value → one `.iv-link` per name.
  - **People page** (`playPeopleTransition`): right/top-aligned `.people-list` with a
    GSAP-driven **inertia (friction) scroll + edge blur** (`plRender`/`plStep`/`peopleRefresh`;
    names blur as they pass the top line `plTopRef` and the bottom edge). Intro = Adobe-Flash
    vector-zoom cascade (`peopleIntroAnimate`). Only entries with `data-person` (currently just
    **Kate Moss**) are clickable; data lives in `PEOPLE_DATA`.
  - **Person page** `#person-stage` (`openPersonPage` flash open, `showPersonStageInstant`):
    looping video background (`assets/index/backgrounds/page_people_<name>.mp4`), centre-right
    credits, centre-left "← people" back (`closePersonPage`), and **VIEW WORKS**
    (`openPersonWorks`) → opens the archive scoped to that person (`archiveScope`); its back
    (`returnToPersonFromWorks`) is an Adobe-Flash zoom back to the person page. The scope label
    is set via `setArchiveScopeLabel` (tracks `currentScopeLabel`); scope state is cleared in
    `openArchive`/`closeArchive`/`forceCloseArchiveInstant`.
- **`figma_data.json`** — design reference. `assets/` (logos, favicon, `calvinklein_intro.mp3`,
  `assets/index/backgrounds/` person videos) and `fonts/` hold static assets.

"Flash animation" in this project means **Adobe-Flash-2000s style** vector motion (scale +
blur + springy `expo.out`/cubic-bezier easing, staggered) — NOT a white camera-flash overlay.
When changing a menu layout or animation: check `style.css` first (CSS keyframes/transitions);
if the motion is scripted, it's a GSAP timeline in `script.js`.

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
