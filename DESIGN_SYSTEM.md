# Calvin Klein Archive — Figma Design System (build notes / handoff)

This file is the source of truth for the Figma design system. Read it at the
**start of any session** that adds pages or changes the design system, together
with the `ck-archive` skill and the Figma skills (`figma-use`,
`figma-generate-library`). It records every component, token, node ID, and the
non‑obvious constraints learned while building it.

---

## 1. Figma file

- **fileKey:** `g8gtmWJT99AGciedmvyguc`
- **URL:** https://www.figma.com/design/g8gtmWJT99AGciedmvyguc/CALVIN-KLEIN
- **Pages:**
  - **Design_System** (`408:165`) — ten 1:1 screen frames. The first six are
    assembled from component **instances**; the Archive (Infinite) frame also
    holds an `Archive Canvas` with the masonry images. The four newest frames
    (People, People — Kate Moss, Timeline, About) are hand‑built but now wired
    to the design‑system: text styles applied, fills bound to the color
    variables, and spacing snapped to the token scale + bound to spacing vars.
  - **Components** (`422:95`) — all atom + composite components.
  - **Foundations** (`463:106`) — Color palette, Type scale, Spacing scale.
  - `Demos`, `old` — legacy, ignore.

The Figma file is edited via the **Figma MCP** (`use_figma` runs Plugin‑API JS
server‑side). Always load the `figma-use` skill before `use_figma`.

---

## 2. Font — the most important constraint

The website uses **Klein** (Book = weight 350, Bold = 700; files in repo at
`fonts/Klein-*.otf`). **Klein cannot be loaded in this Figma session**:
`loadFontAsync({family:'Klein'})` fails — the MCP runs server‑side (cloud), not
on a machine with Klein installed, and a font cannot be uploaded via the API.
A local install does **not** reach this session.

**Stand‑in:** everything is built in **Inter Regular**, set to the *exact* Klein
metrics (size / line‑height / letter‑spacing / case) so a later swap is 1:1.

**To go live in Klein:** edit the font family of the three `Klein/…` **text
styles** (Inter → Klein, style **Book**). Every atom, composite and screen
updates at once. The two real options to make Klein loadable for a fully
editable build are: (A) upload Klein as a Figma **org/shared font**, or (B) run
from a **local** Figma desktop + local Figma MCP where Klein is installed.

---

## 3. Variables

**Color** — `VariableCollectionId:421:95`, mode `Value`:

| name | hex | id | scopes |
|---|---|---|---|
| text/muted | #bbbdc0 | 421:96 | TEXT_FILL |
| text/active | #424242 | 421:97 | TEXT_FILL |
| text/soft | #282828 @85% | 421:98 | TEXT_FILL |
| text/on-dark | #ffffff | 421:99 | TEXT_FILL |
| bg/white | #ffffff | 421:100 | FRAME_FILL, SHAPE_FILL |
| bg/gray | #f4f4f4 | 421:101 | FRAME_FILL, SHAPE_FILL |
| bg/overlay | #ffffff @93% | 421:102 | FRAME_FILL, SHAPE_FILL |
| ink/black | #000000 | 421:103 | FRAME_FILL, SHAPE_FILL |
| cursor/icon | #ffffff | 421:104 | SHAPE_FILL |

**Spacing** — `VariableCollectionId:463:95`, mode `Value`, FLOAT, scopes
`GAP, WIDTH_HEIGHT`: `space/2,4,6,8,12,16,18,24,36,72` (= those px values, ids
`463:96`→`463:105`). These are the real site spacings (menu gap 6, nav gap 16,
canvas gap 72, menu left 36, etc.).

---

## 4. Text styles (Inter stand‑in @ Klein metrics)

Consolidated to **three** styles (was five). The old Label/Value/Cell trio
differed only by line‑height — merged into one **Text** style (we do not
differentiate by line‑height). The old Icon style folded into Text; the old
intro "Title (≈12.3)" was repurposed as the 14px heading.

| style name | spec | used by |
|---|---|---|
| Klein/Text · Upper 12 | 12 / lh 12 / ls 0 / UPPER | menu items, labels, sidebar values, table cells, text buttons, back text, people names |
| Klein/Title · Upper 14 | 14 / lh 12 / ls −0.35 / UPPER | timeline/about nav titles, timeline year, intro kinetic word |
| Klein/Body · 16 | 16 / lh 145% / ls −0.2 / original case | About & Timeline body paragraphs |

---

## 5. Components (page **Components**)

### Atoms
| component | node | variants / props |
|---|---|---|
| Menu Item | `466:135` | **Label** = Archive, People, Timeline, Profile, Search, About, Collections, Advertising, Editorials, Ephemera × **State** = Default/Active. 147px wide. |
| Button / Text | `473:287` | **Label** = Skip Intro, List View, Infinite View, ← back × **State** = Default/Active |
| Button / Back Arrow | `429:104` | **State** = Default/Active (glyph ←) |
| Table / Header Cell | `473:123` | **Column** = #, Campaign, Year, Season, Line, Category, Sub × **State** = Default/Sorted (↓). **Text only, no background.** |
| Table / Row Cell | `429:197` | **State** = Default/Hover. **DATABASE component — single example only.** |
| Item / Meta Row | `472:143` | **Field** = date, category, media, line, photographer, model, director, stylist, art director, creative director, hair, makeup, publication, issue, music. **Value** = editable text. |
| Item / Title | `429:201` | **Label** = editable. (Item headline: campaign → else description → else category.) |
| Search / Text Input | `429:187` | **State** = Placeholder/Focused/Filled. 684px wide. |
| Intro / Word | `429:204` | **Label** = editable. **DATABASE component — single example.** |
| Cursor / Icon | `434:109` | **Icon** = Play, Stop, Rewind, Forward (white SVG glyphs, the site's custom video cursors). |
| Cursor / Pill | `430:110` | **Label** = editable (follow‑cursor "Prev/Next NN/NN"). |

### Composites (made of atom instances)
| component | node | composed of |
|---|---|---|
| Menu | `481:135` | **Mode** = Home / Archive. Menu Item + Back Arrow instances. |
| Item / Details | `483:108` | Item/Title + 4 Item/Meta Row instances (date, category, media, line). |
| Table / Header Row | `484:117` | 7 Table/Header Cell instances on 129px columns. |
| Search / Bar | `484:138` | Search/Text Input + Button/Text (← back). |

**Naming rule (requested):** components/variants are named by **role/field**, not
by example content (e.g. the "UNDERWEAR" heading is `Item / Title`; meta rows use
the field name `line`, not its value).

**Finite vs database rule (requested):** things with a fixed set of values get a
variant per value (Menu Item, Meta Row field, Header Cell column, Button label).
Content/data that evolves (Table Row Cell, Intro Word) is a **single example**
with editable text — never hundreds of variants.

---

## 6. Screen frames (page Design_System) — all assembled from components

| frame | node | uses |
|---|---|---|
| 01 Intro | `408:255` | Intro/Word instances + Skip Intro (Button/Text) |
| 02 Home | `408:289` | Navigation `408:291` = one **Menu (Home)** |
| 03 Archive (Infinite) | `408:373` | Nav `408:380` = **Menu (Archive)**; LIST VIEW (Button/Text); `Archive Canvas` masonry images |
| 03 Archive (List) | `408:467` | Nav `408:4769` = **Menu (Archive)**; Table `408:472` = **Header Row** + data rows (raw text = the DB); INFINITE VIEW (Button/Text) |
| 03 Item View | `410:4793` | Nav `410:4801` = **Menu (Archive)**; sidebar `410:4832` = **Item / Details**; LIST VIEW + Back Arrow |
| 04 Search | `410:4869` | Nav `410:4879` menu item "search"; **Search / Bar** |
| 05 People | `592:361` | right‑aligned people‑names list (Text · Upper 12, `text/muted`); nav links; `← PEOPLE` back |
| 05 People — Kate Moss | `592:541` | person page over the (dark) `ink/black` bg image; credits in `text/on-dark`; `VIEW WORKS`; `← PEOPLE` back |
| 06 Timeline | `592:761` | centred Body · 16 caption; `Title · Upper 14` nav‑title + year ("1992"); `← TIMELINE` back |
| 07 About | `592:819` | centred Body · 16 bio paragraph (per‑word nodes); `Title · Upper 14` nav‑title; `← ABOUT` back |

The four newest frames (People…About) are hand‑built (not component instances)
but are wired to the tokens: **Klein/Text · Upper 12 / Title · Upper 14 / Body ·
16** by role, fills bound to the color variables (`text/muted`, `text/active`,
`text/on-dark`, `bg/white`, `ink/black`), and every auto‑layout gap/padding
snapped to the nearest spacing token and bound to its `space/*` variable.

The list‑view **data rows remain raw text** on purpose — they represent the
archive database (`archive_index.csv`), not design‑system content.

---

## 7. Infinite canvas (Archive Infinite frame)

- Child `Archive Canvas` (clipsContent) holds images masonry‑packed with the
  **real site algorithm**: `COL_W = 290`, `GAP = 72`, 5 columns,
  shortest‑column packing, slight ±~0.5° rotation, block offset ≈ `(-185,-150)`
  so it bleeds off all edges. Column bottoms are filled by **cloning** images
  (the site tiles its canvas), so every column overflows the 1024px height.
- The frame's `Container` (`408:375`) fill was set transparent so the canvas
  shows; nav + LIST VIEW sit above it.

### Image ingest constraint (read before trying to add images)
The agent **cannot upload images itself**: Figma's upload host
(`mcp.figma.com`) is blocked by the egress proxy, the plugin sandbox has no
`fetch`, and `createImageAsync` is unsupported. `figma.createImage(bytes)` works
only with tiny inlined base64 thumbnails. **Workflow:** the **user drops the
images** into the Figma file (as frames, pre‑sized to 290px wide, 1:1 to the
site); the agent then masonry‑arranges them into `Archive Canvas`.

---

## 8. Plugin‑API gotchas (learned the hard way)

- **Fresh text nodes inherit the document default font (Klein, unloaded).**
  Always `node.fontName = {family:'Inter',style:'Regular'}` *before* setting
  `characters`, or apply an Inter text style. Never apply a Klein‑baked style.
- **Text styles must be created fresh as Inter.** A style/node already baked to
  Klein cannot be converted to Inter (conversion needs Klein loaded).
- **`resize()` resets auto‑layout sizing modes** → call `resize()` *before*
  setting `primary/counterAxisSizingMode` or `layoutSizing* = HUG/FILL`.
- `combineAsVariants` infers variant properties from component **names**
  (`Prop=Value, Prop2=Value`).
- Retarget/relabel instances with `instance.swapComponent(variantComponent)` then
  `instance.setProperties({...})`.
- Screenshots: `figma.com` asset URLs are **egress‑blocked**; use
  `get_screenshot` with `enableBase64Response:true`, or `await node.screenshot()`.
- Set a child to `layoutSizingHorizontal='FILL'` only **after** `appendChild`.

---

## 9. How to add a page / make changes (next session)

1. Load `ck-archive` skill, this file, and `figma-use` + `figma-generate-library`.
2. Reuse existing **variables** and **`Klein/…` text styles** — don't recreate.
3. Build the new screen frame, then assemble it from existing **components**
   (prefer the **composites**: Menu, Item/Details, Header Row, Search/Bar).
4. New **finite enum** → add a variant to the matching set; new **content/data**
   → single example + editable text prop. Keep semantic, role‑based names.
5. Validate with base64 screenshots after each step.
6. Images: ask the user to drop them in, then masonry‑arrange (see §7).
7. To go live in Klein: swap the three `Klein/…` text styles to Klein Book (§2).

> Node IDs above are stable references but **re‑verify** with a read‑only
> `use_figma` (`figma.root.children`, `getLocalTextStylesAsync`,
> `getLocalVariableCollectionsAsync`) at session start in case the file changed.
