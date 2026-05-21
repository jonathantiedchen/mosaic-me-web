# UI Redesign — Mosaic Me

**Date:** 2026-05-21
**Status:** Approved

## Goal

Replace the current dark purple/gradient/glass AI-aesthetic with a restrained editorial direction: warm dark background, serif display headlines, flat borders, no gradients, no glow effects, no animations.

---

## Design Language

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `color-bg` | `#1c1917` | Page background |
| `color-surface` | `#242018` | Upload zone, setting chips, card backgrounds |
| `color-border` | `#2e2a26` | All hairline borders and dividers |
| `color-text-primary` | `#f5f0e8` | Headlines, body text |
| `color-text-secondary` | `#7a716c` | Sublines, labels, disclaimer |
| `color-text-muted` | `#5a5450` | Placeholder text, inactive states |
| `color-accent` | `#c4a882` | Kicker lines, hover borders, CTA button bg, tab underline |
| `color-accent-hover` | `#d4b892` | Accent hover state |
| `color-error` | `#c0392b` | Error border |

### Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Wordmark | DM Serif Display | 400 | 17px | Nav logo |
| Headline | DM Serif Display | 400 | 52px | "LEGO" in italic |
| Kicker | DM Sans | 500 | 10px | Uppercase, `letter-spacing: .2em` |
| Body | DM Sans | 300 | 13px | Sublines, descriptions |
| UI labels | DM Sans | 500 | 12–13px | Buttons, chip values |
| Chip labels | DM Sans | 500 | 9px | Uppercase, `letter-spacing: .14em` |
| Disclaimer | DM Sans | 300 | 10px | Footer, action section |

Both fonts loaded from Google Fonts. Inter removed entirely.

### Shape & Decoration

- **Border radius:** `2px` everywhere — no pill buttons, no heavy rounding
- **Shadows:** None
- **Gradients:** None — remove all `bg-gradient-*`, `from-*`, `via-*`, `to-*` classes and inline gradient styles
- **Backdrop blur / glass:** None — remove all `backdrop-filter`, `glass-intense`, `glass` classes
- **Animations:** None — remove `animate-float-slow`, `animate-bounce`, `animate-pulse`, `animate-in`, floating orb divs

### Borders

All borders use `1px solid #2e2a26`. Error state uses `1px solid #c0392b`. Accent hover state uses `1px solid #c4a882`.

---

## Components

### `index.css`

- Remove `body::before` (radial gradient orbs)
- Remove `body::after` (grid pattern)
- Remove `.card`, `.card-hover`, `.glass-intense` classes
- Remove `.btn-primary` gradient styles
- Remove `@keyframes float-slow` and `.animate-float-slow`
- Set `body { background: #1c1917; font-family: 'DM Sans', sans-serif; }`
- Add Google Fonts import for DM Serif Display + DM Sans
- Add new component classes: `.btn-generate`, `.setting-chip`, `.upload-zone`, `.tab-underline`

### `tailwind.config.js`

Add custom color tokens under `theme.extend.colors` matching the table above so they can be used as Tailwind classes (`bg-surface`, `border-border`, `text-accent`, etc.).

### Nav (inside `HomePage.tsx`)

- Left: wordmark in DM Serif Display
- Right: GitHub link (plain text, muted, `↗`)
- Bottom: `1px solid #2e2a26` border
- Height: `52px`, horizontal padding `28px`
- Remove: any existing header/nav component if present; this is inlined in `HomePage`

### Hero (`HomePage.tsx`)

Visible only when no upload and no results.

- Kicker: short gold rule (`20px wide, 1px tall, #c4a882`) + "Free · No signup · Instant" in `DM Sans 500` uppercase
- Headline: `DM Serif Display`, 52px, "Turn photos into *LEGO* art." — the word LEGO in `<em>` styled `color: #c4a882; font-style: italic`
- Subline: `DM Sans 300`, 13px, muted, max-width ~280px
- Remove: floating orbs, Sparkles icon, gradient text spans, ArrowDown bounce

### Upload Zone (`ImageUpload.tsx`)

- Container: `border: 1px solid #2e2a26`, `background: #242018`, `border-radius: 2px`, padding `28px 20px`, centered text
- Upload icon: thin circle border (`36×36px`, `border: 1.5px solid #3a3530`), SVG arrow-up inside, `color: #6b6460`
- Primary label: "Drop a photo, or click to browse" — `DM Sans 500`, 13px, `#d5cfc8`
- Secondary label: "JPG, PNG, WEBP — up to 10 MB" — `DM Sans 300`, 11px, `#5a5450`
- Hover state: `border-color: #c4a882`, `background: #2a241e`
- Remove: all existing drag-highlight gradient effects

### Settings Chips (new inline section in `ConfigPanel.tsx` or `HomePage.tsx`)

Three chips in a flex row below the upload zone, gap `10px`.

Each chip:
- `border: 1px solid #2e2a26`, `background: #242018`, `border-radius: 2px`, padding `9px 12px`
- Label: `DM Sans 500`, 9px, uppercase, `letter-spacing: .14em`, `color: #5a5450`
- Value: `DM Sans 500`, 12px, `color: #c5bfb8`
- On click: opens existing config popover/dropdown inline (existing `ConfigPanel` logic preserved, only shell styling changes)

Chips show: **Size** (e.g. "48 × 48"), **Palette** (e.g. "Standard"), **Style** (e.g. "Classic").

### Generate Button

- Full width, `background: #c4a882`, `color: #1c1917`, `border-radius: 2px`, padding `13px 20px`
- Label: "Generate mosaic →", `DM Sans 500`, 13px, `letter-spacing: .04em`
- Hover: `background: #d4b892`
- Loading state: subtle text swap to "Generating…" + disabled, no spinner animation
- Replaces all `.btn-primary` gradient buttons

### Results Area (`ResultsTabs.tsx`)

**Tab bar:**
- Plain text tabs, `DM Sans 500`, 13px
- Active: `color: #f5f0e8` + `2px solid #c4a882` bottom underline
- Inactive: `color: #5a5450`, no underline
- No background fills, no pill/badge styling on tabs
- Tab bar bottom border: `1px solid #2e2a26`

**Tab content panels:**
- Container: `border: 1px solid #2e2a26`, `background: #242018`, `border-radius: 2px`
- Mosaic preview: image displayed as-is, no glow, no shadow, no border-radius beyond 2px
- Tables (shopping list, instructions): `DM Sans`, thin `1px solid #2e2a26` row dividers, no zebra striping, no background fills
- Primary action buttons: same `.btn-generate` style (gold bg, dark text)
- Secondary actions: plain text + `→`, `color: #c4a882`

### Feedback Widget (`FeedbackWidget.tsx`)

- Remove pill/glass container styling
- Two flat icon buttons: `border: 1px solid #2e2a26`, `background: #242018`, `border-radius: 2px`, padding `8px`
- Hover: `border-color: #c4a882`
- Active/selected: `border-color: #c4a882`, icon `color: #c4a882`
- Comment textarea: `border: 1px solid #2e2a26`, `background: #242018`, `border-radius: 2px`, `color: #f5f0e8`, `DM Sans 300`
- Section label "How did we do?": `DM Sans 500`, 10px, uppercase, muted

### Error State (`HomePage.tsx`)

- Container: `border: 1px solid #c0392b`, `background: #242018`, `border-radius: 2px`, padding `16px 20px`
- No icon container with backdrop blur
- Title: `DM Sans 500`, 13px, `color: #e57373`
- Message: `DM Sans 300`, 12px, `color: #a06060`

### Footer (`HomePage.tsx`)

- Top border: `1px solid #2e2a26`
- Left: wordmark (`DM Serif Display`) + "· Made with care" muted
- Right: GitHub link + "Not affiliated with LEGO Group"
- `DM Sans 300`, 11–12px, `color: #5a5450`
- Remove gradient `from-transparent to-black/20`

---

## What Gets Removed

- All purple/indigo/pink color usage (`indigo-*`, `purple-*`, `pink-*` Tailwind classes)
- All `bg-gradient-*`, `from-*`, `via-*`, `to-*` gradient classes and inline styles
- All `backdrop-filter`, `blur-*` classes
- `.glass-intense`, `.card`, `.card-hover` CSS classes
- Floating orb `<div>`s in `HomePage.tsx`
- `Sparkles`, `ArrowDown` lucide icons
- `animate-float-slow`, `animate-bounce`, `animate-pulse`, `animate-in` animations
- `@keyframes float-slow` from `index.css`
- `body::before` and `body::after` pseudo-elements
- Inter font reference (replaced by DM Sans + DM Serif Display)

---

## Files to Change

| File | Change |
|---|---|
| `frontend/src/index.css` | Full rewrite of base styles and component classes |
| `frontend/index.html` | Swap Google Fonts link to DM Sans + DM Serif Display |
| `frontend/tailwind.config.js` | Add custom color tokens |
| `frontend/src/pages/HomePage.tsx` | Remove orbs/hero decoration, add nav, new error/footer styling |
| `frontend/src/components/ImageUpload.tsx` | Restyle upload zone |
| `frontend/src/components/ConfigPanel.tsx` | Restyle as collapsed chips row |
| `frontend/src/components/ResultsTabs.tsx` | Restyle tabs, panels, tables, buttons |
| `frontend/src/components/FeedbackWidget.tsx` | Restyle thumbs + textarea |
