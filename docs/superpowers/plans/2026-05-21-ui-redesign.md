# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the purple/gradient/glass AI aesthetic with a restrained editorial dark direction: warm `#1c1917` background, DM Serif Display headlines, flat borders, gold accent, no gradients or animations.

**Architecture:** Pure restyling — no logic changes. Each task targets one file or closely-related pair of files. All components keep their existing React structure and props; only classNames, inline styles, and CSS classes change. The Tailwind config gets new design tokens first, then each component is updated to use them.

**Tech Stack:** React, TypeScript, Tailwind CSS v3, custom CSS (`index.css`), Google Fonts (DM Sans + DM Serif Display)

**Spec:** `docs/superpowers/specs/2026-05-21-ui-redesign-design.md`

---

## File Map

| File | Change |
|---|---|
| `frontend/index.html` | Add Google Fonts link for DM Sans + DM Serif Display |
| `frontend/tailwind.config.js` | Replace purple/indigo tokens with editorial design tokens |
| `frontend/src/index.css` | Full rewrite: remove gradients/glass/animations, add new component classes |
| `frontend/src/pages/HomePage.tsx` | Add nav, restyle hero, error state, footer; remove orbs/icons |
| `frontend/src/components/ImageUpload.tsx` | Restyle upload zone and file-selected state |
| `frontend/src/components/ConfigPanel.tsx` | Restyle as collapsed chips row + expanded settings |
| `frontend/src/components/ResultsTabs.tsx` | Restyle tab bar, panels, stats, tables, buttons |
| `frontend/src/components/FeedbackWidget.tsx` | Restyle thumbs buttons, modal, textarea |

---

## Task 1: Add Google Fonts + Tailwind Design Tokens

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Add Google Fonts to index.html**

Replace the contents of `frontend/index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mosaic-Me | Transform Photos into LEGO Mosaics</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace tailwind.config.js**

Replace the full contents of `frontend/tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: '#1c1917',
        surface: '#242018',
        border: '#2e2a26',
        'text-primary': '#f5f0e8',
        'text-secondary': '#7a716c',
        'text-muted': '#5a5450',
        accent: '#c4a882',
        'accent-hover': '#d4b892',
        error: '#c0392b',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Start the dev server and verify it compiles without errors**

```bash
cd frontend && npm run dev
```

Expected: Vite compiles successfully, no TypeScript or Tailwind errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/tailwind.config.js
git commit -m "feat: add DM Serif Display/DM Sans fonts and editorial design tokens"
```

---

## Task 2: Rewrite index.css

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Replace index.css entirely**

Replace the full contents of `frontend/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply min-h-screen bg-bg text-text-primary;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.01em;
    overflow-x: hidden;
  }
}

@layer components {
  .btn-generate {
    @apply w-full bg-accent text-bg font-sans font-medium text-sm rounded-sm
           flex items-center justify-center gap-2
           transition-colors duration-200;
    padding: 13px 20px;
    letter-spacing: 0.04em;
    border-radius: 2px;
  }

  .btn-generate:hover:not(:disabled) {
    @apply bg-accent-hover;
  }

  .btn-generate:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-ghost {
    @apply border text-text-secondary font-sans font-medium text-sm
           transition-colors duration-200;
    border-color: #2e2a26;
    border-radius: 2px;
    padding: 9px 14px;
  }

  .btn-ghost:hover:not(:disabled) {
    @apply border-accent text-text-primary;
  }

  .btn-ghost:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .panel {
    border: 1px solid #2e2a26;
    border-radius: 2px;
    background: #242018;
  }

  .setting-chip {
    @apply border bg-surface flex-1;
    border-color: #2e2a26;
    border-radius: 2px;
    padding: 9px 12px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .setting-chip:hover {
    border-color: #c4a882;
  }

  .chip-label {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5a5450;
    margin-bottom: 2px;
  }

  .chip-value {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: #c5bfb8;
  }

  .upload-zone {
    border: 1px solid #2e2a26;
    border-radius: 2px;
    background: #242018;
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .upload-zone:hover,
  .upload-zone.drag-active {
    border-color: #c4a882;
    background: #2a241e;
  }

  .upload-zone.has-error {
    border-color: #c0392b;
  }

  .tab-btn {
    @apply font-sans font-medium text-sm transition-colors duration-200 relative;
    padding: 14px 20px;
    color: #5a5450;
    letter-spacing: 0.01em;
  }

  .tab-btn:hover {
    color: #c5bfb8;
  }

  .tab-btn.active {
    color: #f5f0e8;
  }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #c4a882;
  }
}
```

- [ ] **Step 2: Verify dev server still compiles**

Check the terminal running `npm run dev` — no errors expected.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat: rewrite index.css with editorial design system"
```

---

## Task 3: Restyle HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Replace HomePage.tsx**

Replace the full contents of `frontend/src/pages/HomePage.tsx` with:

```tsx
import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { FeedbackWidget } from '../components/FeedbackWidget';
import { AlertCircle, Github } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error, mosaicData, uploadedFile } = useMosaic();
  const hasResults = !!mosaicData;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #2e2a26', height: '52px' }}
           className="flex items-center justify-between px-7 flex-shrink-0">
        <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: '17px', color: '#f5f0e8' }}>
          Mosaic Me
        </span>
        <a
          href="https://github.com/jonathantiedchen/mosaic-me-web"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          style={{ fontSize: '12px' }}
        >
          <Github className="w-4 h-4" strokeWidth={1.5} />
          GitHub ↗
        </a>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 sm:py-16">
        {/* Error */}
        {error && (
          <div className="mb-8 panel p-5 flex items-start gap-4" style={{ borderColor: '#c0392b' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#e57373' }} strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#e57373' }}>Error</p>
              <p className="text-sm mt-1" style={{ color: '#a06060', fontWeight: 300 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Hero */}
        {!uploadedFile && !hasResults && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: '20px', height: '1px', background: '#c4a882', flexShrink: 0 }} />
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                fontSize: '10px',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: '#c4a882',
              }}>
                Free · No signup · Instant
              </span>
            </div>
            <h1 style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: 'clamp(40px, 8vw, 56px)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: '#f5f0e8',
              marginBottom: '16px',
            }}>
              Turn photos into{' '}
              <em style={{ color: '#c4a882', fontStyle: 'italic' }}>LEGO</em>
              {' '}art.
            </h1>
            <p style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 300,
              fontSize: '13px',
              lineHeight: 1.65,
              color: '#7a716c',
              maxWidth: '320px',
            }}>
              Upload any image to generate a complete LEGO mosaic — assembly instructions,
              part counts, and a Pick-a-Brick shopping list.
            </p>
          </div>
        )}

        {/* Upload + Config */}
        <div className="mb-10">
          <ConfigPanel />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-8">
            <ResultsTabs />
            {mosaicData?.sessionId && (
              <div className="flex flex-col items-center gap-3">
                <p style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: '10px',
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: '#5a5450',
                }}>
                  How did we do?
                </p>
                <FeedbackWidget sessionId={mosaicData.sessionId} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2e2a26' }}>
        <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450' }}>
            <span style={{ fontFamily: '"DM Serif Display", serif', color: '#7a716c' }}>Mosaic Me</span>
            {' '}· Made with care
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/jonathantiedchen/mosaic-me-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
              style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450' }}
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
              GitHub
            </a>
            <span style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450' }}>
              Not affiliated with LEGO Group
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Check the browser — hero, nav, and footer should render in the new style**

Visit `http://localhost:5173`. Verify:
- Nav shows "Mosaic Me" in serif, GitHub link right
- Hero shows gold kicker line + serif headline with italic gold "LEGO"
- No floating orbs or Sparkles icon
- Footer is plain text, no gradient

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat: restyle HomePage with editorial nav, hero, footer"
```

---

## Task 4: Restyle ImageUpload

**Files:**
- Modify: `frontend/src/components/ImageUpload.tsx`

- [ ] **Step 1: Replace ImageUpload.tsx**

Replace the full contents of `frontend/src/components/ImageUpload.tsx` with:

```tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const SAMPLE_EXAMPLES = [
  { raw: '/samples/raw_1.jpg', mosaic: '/samples/mosaic_1.png', name: 'Example 1' },
  { raw: '/samples/raw_2.jpeg', mosaic: '/samples/mosaic_2.png', name: 'Example 2' },
];

export function ImageUpload() {
  const { uploadedFile, setUploadedFile, clearMosaic } = useMosaic();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) setUploadedFile(acceptedFiles[0]);
    },
    [setUploadedFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  const handleClear = () => {
    setUploadedFile(null);
    clearMosaic();
  };

  const hasErrors = fileRejections.length > 0;
  const errorMessage = hasErrors
    ? fileRejections[0].errors[0].code === 'file-too-large'
      ? 'File is too large. Maximum size is 10 MB.'
      : fileRejections[0].errors[0].code === 'file-invalid-type'
      ? 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      : 'File upload error. Please try again.'
    : null;

  if (uploadedFile) {
    return (
      <div className="panel flex items-center gap-4 px-4 py-3">
        <div style={{ padding: '8px', background: '#2e2a26', borderRadius: '2px', flexShrink: 0 }}>
          <ImageIcon className="w-5 h-5" style={{ color: '#7a716c' }} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#f5f0e8' }}>
            {uploadedFile.name}
          </p>
          <p style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450', marginTop: '2px' }}>
            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex-shrink-0 transition-colors"
          style={{ color: '#5a5450', padding: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e57373')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5a5450')}
          aria-label="Remove image"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? ' drag-active' : ''}${hasErrors ? ' has-error' : ''}`}
      >
        <input {...getInputProps()} />
        <div style={{
          width: '36px',
          height: '36px',
          border: '1.5px solid #3a3530',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: '#6b6460',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#d5cfc8', marginBottom: '4px' }}>
          {isDragActive ? 'Drop it here' : 'Drop a photo, or click to browse'}
        </p>
        <p style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450' }}>
          JPG, PNG, WEBP — up to 10 MB
        </p>
        {hasErrors && (
          <p style={{ fontSize: '12px', color: '#e57373', marginTop: '10px' }}>{errorMessage}</p>
        )}
      </div>

      {/* Examples */}
      <div style={{ borderTop: '1px solid #2e2a26', paddingTop: '20px' }}>
        <p style={{
          fontSize: '9px', fontWeight: 500, letterSpacing: '.18em',
          textTransform: 'uppercase', color: '#5a5450',
          textAlign: 'center', marginBottom: '14px',
        }}>
          Examples
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {SAMPLE_EXAMPLES.map((example, index) => (
            <div key={index} style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '12px', background: '#242018' }}>
              <div className="flex gap-3">
                <img
                  src={example.raw}
                  alt={`${example.name} - Original`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <img
                  src={example.mosaic}
                  alt={`${example.name} - Mosaic`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
                />
              </div>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a5450', textAlign: 'center', marginTop: '10px' }}>
                {example.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:5173`. Check:
- Upload zone is flat dark box with circle icon, no glow
- Hover changes border to gold
- File-selected state shows filename in flat panel with muted icon
- Examples section has flat bordered thumbnails

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ImageUpload.tsx
git commit -m "feat: restyle ImageUpload with flat editorial style"
```

---

## Task 5: Restyle ConfigPanel

**Files:**
- Modify: `frontend/src/components/ConfigPanel.tsx`

- [ ] **Step 1: Replace ConfigPanel.tsx**

Replace the full contents of `frontend/src/components/ConfigPanel.tsx` with:

```tsx
import { useState } from 'react';
import { useMosaic } from '../hooks/useMosaic';
import { ImageUpload } from './ImageUpload';
import { RotateCcw } from 'lucide-react';

const BASEPLATE_SIZES = [32, 48, 64, 96, 128] as const;

export function ConfigPanel() {
  const {
    config,
    setConfig,
    uploadedFile,
    generateMosaic,
    isLoading,
    clearMosaic,
    mosaicData,
  } = useMosaic();

  const hasResults = !!mosaicData;
  const [expandedChip, setExpandedChip] = useState<'size' | 'palette' | 'type' | null>(null);

  const handleGenerate = () => {
    if (uploadedFile) generateMosaic(uploadedFile);
  };

  const handleReset = () => {
    clearMosaic();
    setExpandedChip(null);
  };

  const toggleChip = (chip: 'size' | 'palette' | 'type') => {
    setExpandedChip(prev => (prev === chip ? null : chip));
  };

  const pieceTypeLabel = config.pieceType === 'square' ? 'Square' : 'Round';
  const sizeLabel = `${config.baseplateSize} × ${config.baseplateSize}`;

  return (
    <div className="space-y-3">
      <ImageUpload />

      {/* Chips row */}
      <div className="flex gap-2">
        <button className="setting-chip text-left" onClick={() => toggleChip('size')}>
          <div className="chip-label">Size</div>
          <div className="chip-value">{sizeLabel}</div>
        </button>
        <button className="setting-chip text-left" onClick={() => toggleChip('palette')}>
          <div className="chip-label">Palette</div>
          <div className="chip-value">Standard</div>
        </button>
        <button className="setting-chip text-left" onClick={() => toggleChip('type')}>
          <div className="chip-label">Piece</div>
          <div className="chip-value">{pieceTypeLabel}</div>
        </button>
      </div>

      {/* Size expander */}
      {expandedChip === 'size' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Baseplate size (studs)</p>
          <div className="flex gap-2 flex-wrap">
            {BASEPLATE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => { setConfig({ ...config, baseplateSize: size }); setExpandedChip(null); }}
                disabled={isLoading}
                style={{
                  border: `1px solid ${config.baseplateSize === size ? '#c4a882' : '#2e2a26'}`,
                  background: config.baseplateSize === size ? '#2a241e' : '#1c1917',
                  color: config.baseplateSize === size ? '#c4a882' : '#7a716c',
                  borderRadius: '2px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Piece type expander */}
      {expandedChip === 'type' && (
        <div className="panel p-4 space-y-3">
          <p className="chip-label">Piece type</p>
          <div className="flex gap-2">
            {(['square', 'round'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setConfig({ ...config, pieceType: type }); setExpandedChip(null); }}
                disabled={isLoading}
                style={{
                  border: `1px solid ${config.pieceType === type ? '#c4a882' : '#2e2a26'}`,
                  background: config.pieceType === type ? '#2a241e' : '#1c1917',
                  color: config.pieceType === type ? '#c4a882' : '#7a716c',
                  borderRadius: '2px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleGenerate}
          disabled={!uploadedFile || isLoading}
          className="btn-generate flex-1"
        >
          {isLoading ? 'Generating…' : 'Generate mosaic →'}
        </button>
        {(uploadedFile || hasResults) && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="btn-ghost flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {uploadedFile && (
        <p style={{ fontSize: '10px', fontWeight: 300, color: '#5a5450', textAlign: 'center' }}>
          Not affiliated with the LEGO Group
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Check:
- Three chips appear below upload zone (Size, Piece, Palette)
- Clicking "Size" reveals a flat panel with size options; selecting one closes it
- Clicking "Piece" reveals square/round options
- Generate button is gold with dark text
- Reset button is ghost style

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ConfigPanel.tsx
git commit -m "feat: restyle ConfigPanel with collapsed chips and flat expanders"
```

---

## Task 6: Restyle ResultsTabs

**Files:**
- Modify: `frontend/src/components/ResultsTabs.tsx`

- [ ] **Step 1: Replace the tab bar (lines 42–100)**

Find this block in `ResultsTabs.tsx`:

```tsx
  return (
    <div className="card card-hover overflow-hidden">
      <div className="border-b border-white/5 backdrop-blur-xl bg-gradient-to-r from-white/5 to-transparent">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'preview'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
            <span>Preview</span>
            {activeTab === 'preview' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'instructions'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            <span>Instructions</span>
            {activeTab === 'instructions' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`
              flex-1 px-6 py-5 text-sm font-bold transition-all duration-300
              flex items-center justify-center gap-3 relative uppercase tracking-wider
              ${
                activeTab === 'shopping'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
            <span>Shopping</span>
            {activeTab === 'shopping' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50"></div>
            )}
          </button>
        </nav>
      </div>
```

Replace it with:

```tsx
  return (
    <div className="panel overflow-hidden">
      <div style={{ borderBottom: '1px solid #2e2a26' }}>
        <nav className="flex">
          {(['preview', 'instructions', 'shopping'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              style={{ flex: 1 }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
```

- [ ] **Step 2: Restyle the preview panel content area**

Find:
```tsx
      <div className="p-4 sm:p-6 lg:p-8">
```
Replace with:
```tsx
      <div className="p-5 sm:p-6">
```

- [ ] **Step 3: Restyle the mosaic preview image container**

Find:
```tsx
                <div className="relative overflow-auto rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 via-indigo-950/20 to-black/60 p-6 max-h-[600px] backdrop-blur-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none"></div>
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    className="relative max-w-none rounded-2xl shadow-2xl shadow-indigo-900/30"
                  />
                </div>
```
Replace with:
```tsx
                <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '16px', overflowAuto: 'auto', maxHeight: '600px', overflowY: 'auto', overflowX: 'auto' }}>
                  <img
                    src={mosaicData.previewUrl}
                    alt="Mosaic preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                    className="max-w-none"
                  />
                </div>
```

- [ ] **Step 4: Restyle the stats cards (Size, Pieces, Colors)**

Find:
```tsx
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Size</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.baseplateSize}×{mosaicData.metadata.baseplateSize}
                    </p>
                  </div>
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Pieces</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.totalPieces}
                    </p>
                  </div>
                  <div className="relative card card-hover p-5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <p className="relative text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Colors</p>
                    <p className="relative text-white font-black text-2xl">
                      {mosaicData.metadata.uniqueColors}
                    </p>
                  </div>
                </div>
```
Replace with:
```tsx
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Size', value: `${mosaicData.metadata.baseplateSize}×${mosaicData.metadata.baseplateSize}` },
                    { label: 'Pieces', value: mosaicData.metadata.totalPieces },
                    { label: 'Colors', value: mosaicData.metadata.uniqueColors },
                  ].map(({ label, value }) => (
                    <div key={label} className="panel p-4">
                      <p className="chip-label mb-2">{label}</p>
                      <p style={{ fontSize: '22px', fontWeight: 600, color: '#f5f0e8', letterSpacing: '-0.03em' }}>{value}</p>
                    </div>
                  ))}
                </div>
```

- [ ] **Step 5: Restyle zoom controls and action buttons**

Find:
```tsx
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="btn-secondary p-3.5 disabled:opacity-10 disabled:cursor-not-allowed"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <span className="text-sm font-black text-white min-w-[80px] text-center px-5 py-3 card backdrop-blur-xl">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="btn-secondary p-3.5 disabled:opacity-10 disabled:cursor-not-allowed"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEditMosaic}
                      className="btn-secondary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold"
                    >
                      <Edit className="w-5 h-5" strokeWidth={2.5} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleExport('mosaic-png', `mosaic-${mosaicData.sessionId}.png`)}
                      disabled={isExporting}
                      className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm disabled:opacity-20"
                    >
                      {isExporting ? (
                        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      ) : (
                        <Download className="w-5 h-5" strokeWidth={2.5} />
                      )}
                      <span>Download</span>
                    </button>
                  </div>
```
Replace with:
```tsx
                  <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} disabled={zoom <= 0.5} className="btn-ghost" aria-label="Zoom out">
                      <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#c5bfb8', minWidth: '44px', textAlign: 'center' }}>
                      {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={handleZoomIn} disabled={zoom >= 3} className="btn-ghost" aria-label="Zoom in">
                      <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleEditMosaic} className="btn-ghost flex items-center gap-2">
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleExport('mosaic-png', `mosaic-${mosaicData.sessionId}.png`)}
                      disabled={isExporting}
                      className="btn-generate"
                      style={{ width: 'auto', padding: '9px 16px' }}
                    >
                      <Download className="w-4 h-4" strokeWidth={1.5} />
                      {isExporting ? 'Downloading…' : 'Download'}
                    </button>
                  </div>
```

- [ ] **Step 6: Restyle instructions tab download button**

Find:
```tsx
            <div className="flex justify-end">
              <button
                onClick={() => handleExport('instructions-png', `instructions-${mosaicData.sessionId}.png`)}
                disabled={isExporting}
                className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                )}
                <span>Download</span>
              </button>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-xl p-3 sm:p-4 lg:p-6">
```
Replace with:
```tsx
            <div className="flex justify-end">
              <button
                onClick={() => handleExport('instructions-png', `instructions-${mosaicData.sessionId}.png`)}
                disabled={isExporting}
                className="btn-generate"
                style={{ width: 'auto', padding: '9px 16px' }}
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                {isExporting ? 'Downloading…' : 'Download'}
              </button>
            </div>
            <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '16px' }}>
```

- [ ] **Step 7: Restyle shopping tab**

Find:
```tsx
            <div className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="card card-hover px-6 py-4 backdrop-blur-xl">
                  <p className="text-sm font-bold text-white">
                    Total: <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{mosaicData.metadata.totalPieces}</span> pieces
                  </p>
                </div>
                <div className="card card-hover px-6 py-4 backdrop-blur-xl">
                  <p className="text-sm font-bold text-white">
                    Estimated: <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">${(mosaicData.metadata.totalPieces * 0.06).toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('pickabrick-csv', `pickabrick-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-primary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  <span>Pick-a-Brick</span>
                </button>
                <button
                  onClick={() => handleExport('shopping-csv', `shopping-list-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-secondary flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold disabled:opacity-20"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                  )}
                  <span>CSV</span>
                </button>
              </div>
            </div>
```
Replace with:
```tsx
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="panel px-4 py-3">
                  <p className="chip-label mb-1">Total pieces</p>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#f5f0e8', letterSpacing: '-0.02em' }}>
                    {mosaicData.metadata.totalPieces}
                  </p>
                </div>
                <div className="panel px-4 py-3">
                  <p className="chip-label mb-1">Est. cost</p>
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#f5f0e8', letterSpacing: '-0.02em' }}>
                    ${(mosaicData.metadata.totalPieces * 0.06).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('pickabrick-csv', `pickabrick-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-generate"
                  style={{ width: 'auto', padding: '9px 16px' }}
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Pick-a-Brick
                </button>
                <button
                  onClick={() => handleExport('shopping-csv', `shopping-list-${mosaicData.sessionId}.csv`)}
                  disabled={isExporting}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  CSV
                </button>
              </div>
            </div>
```

- [ ] **Step 8: Restyle warning block and Pick-a-Brick instructions block**

Find:
```tsx
              <div className="relative card p-6 overflow-hidden border-2 border-amber-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="relative flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <h4 className="font-black text-white text-lg mb-2">
```
Replace with:
```tsx
              <div className="panel p-5" style={{ borderColor: '#c4a882' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c4a882' }} strokeWidth={1.5} />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f5f0e8', marginBottom: '6px' }}>
```

Find the closing tags for that block and replace:
```tsx
                  </div>
                </div>
              </div>
            )}

            {/* Pick-a-Brick Instructions */}
            <div className="relative card card-hover p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none"></div>
              <div className="relative flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full shadow-lg shadow-amber-500/50"></div>
                <h4 className="font-black text-white text-lg tracking-tight">
                  How to order from LEGO Pick-a-Brick
                </h4>
              </div>
              <ol className="relative text-sm text-gray-300 space-y-4 list-decimal list-inside font-medium">
```
With:
```tsx
                  </div>
                </div>
              </div>
            )}

            <div className="panel p-5">
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f5f0e8', marginBottom: '12px' }}>
                How to order from LEGO Pick-a-Brick
              </h4>
              <ol style={{ fontSize: '13px', fontWeight: 300, color: '#7a716c', lineHeight: 1.8, paddingLeft: '16px' }}>
```

Find:
```tsx
              </ol>
              <p className="relative text-xs text-gray-400 mt-6 italic">
                Note: Price estimate is based on approximately $0.06 per 1×1 plate. Actual prices may vary by region and availability.
              </p>
            </div>
```
Replace with:
```tsx
              </ol>
              <p style={{ fontSize: '11px', fontWeight: 300, color: '#5a5450', marginTop: '12px' }}>
                Price estimate based on ~$0.06 per 1×1 plate. Actual prices vary by region.
              </p>
            </div>
```

- [ ] **Step 9: Restyle InstructionsView subcomponent**

Find inside `InstructionsView`:
```tsx
      <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            Color Legend
          </h4>
```
Replace with:
```tsx
      <h4 className="chip-label mb-3">Color Legend</h4>
```

Find:
```tsx
          <div className="space-y-1.5 sm:space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
            {shoppingList.map((item, index) => (
              <div key={item.colorId} className="flex items-center gap-2 sm:gap-3 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-xs sm:text-sm font-bold text-purple-300 w-6 sm:w-8 flex-shrink-0">
                  {index + 1}
                </span>
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-white/30 shadow-lg flex-shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs sm:text-sm text-white font-medium truncate">{item.colorName}</span>
              </div>
            ))}
          </div>
```
Replace with:
```tsx
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {shoppingList.map((item, index) => (
              <div key={item.colorId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #2e2a26' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#5a5450', width: '20px', flexShrink: 0 }}>
                  {index + 1}
                </span>
                <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', flexShrink: 0, backgroundColor: item.hex }} />
                <span style={{ fontSize: '12px', fontWeight: 300, color: '#c5bfb8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</span>
              </div>
            ))}
          </div>
```

Find the second heading "How to Build":
```tsx
          <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            How to Build
          </h4>
          <div className="text-xs sm:text-sm text-purple-100 space-y-2 sm:space-y-3 bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">1.</span>
              <span>Each number in the grid corresponds to a color in the legend</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">2.</span>
              <span>Place LEGO pieces according to the grid pattern</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">3.</span>
              <span>Start from the top-left corner and work across and down</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-purple-300 flex-shrink-0">4.</span>
              <span>Use the shopping list to order required pieces</span>
            </p>
          </div>
```
Replace with:
```tsx
          <h4 className="chip-label mb-3">How to Build</h4>
          <ol style={{ fontSize: '12px', fontWeight: 300, color: '#7a716c', lineHeight: 1.8, paddingLeft: '16px' }}>
            <li>Each number in the grid corresponds to a color in the legend</li>
            <li>Place LEGO pieces according to the grid pattern</li>
            <li>Start from the top-left corner, work across and down</li>
            <li>Use the shopping list to order required pieces</li>
          </ol>
```

Find the grid container:
```tsx
      <div className="overflow-auto bg-white/5 rounded-lg p-2 sm:p-3 lg:p-4 border border-white/10">
```
Replace with:
```tsx
      <div style={{ overflowAuto: 'auto', border: '1px solid #2e2a26', borderRadius: '2px', padding: '12px', overflowX: 'auto', overflowY: 'auto' }}>
```

- [ ] **Step 10: Restyle ShoppingListView subcomponent**

Find:
```tsx
      <div className="sm:hidden space-y-2">
        {items.map((item) => (
          <div key={item.colorId} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-white/30 shadow-lg flex-shrink-0"
                style={{ backgroundColor: item.hex }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{item.colorName}</p>
                <p className="text-xs text-purple-300 mt-0.5">Quantity: <span className="font-bold text-white">{item.quantity}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
```
Replace with:
```tsx
      <div className="sm:hidden space-y-1">
        {items.map((item) => (
          <div key={item.colorId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #2e2a26' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', flexShrink: 0, backgroundColor: item.hex }} />
            <p style={{ flex: 1, fontSize: '13px', fontWeight: 300, color: '#c5bfb8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.colorName}</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#f5f0e8', flexShrink: 0 }}>{item.quantity}</p>
          </div>
        ))}
      </div>
```

Find the desktop table:
```tsx
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/20">
            <tr>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                Color
              </th>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 lg:px-6 lg:py-4 text-right text-xs font-bold text-purple-300 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((item) => (
              <tr key={item.colorId} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 lg:px-6 lg:py-4">
                  <div
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg border-2 border-white/30 shadow-lg"
                    style={{ backgroundColor: item.hex }}
                  />
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4 text-sm text-white font-medium">
                  {item.colorName}
                </td>
                <td className="px-4 py-3 lg:px-6 lg:py-4 text-sm text-white text-right font-bold">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
```
Replace with:
```tsx
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e2a26' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Color</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }} className="chip-label">Name</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }} className="chip-label">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.colorId} style={{ borderBottom: '1px solid #2e2a26' }}>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '2px', border: '1px solid #2e2a26', backgroundColor: item.hex }} />
                </td>
                <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 300, color: '#c5bfb8' }}>
                  {item.colorName}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 500, color: '#f5f0e8', textAlign: 'right' }}>
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
```

- [ ] **Step 11: Remove unused lucide icons from ResultsTabs imports**

At the top of `ResultsTabs.tsx`, update the import to remove `Loader2` if `animate-spin` was the only usage, and ensure only used icons remain:

```tsx
import { Download, ZoomIn, ZoomOut, Image as ImageIcon, BookOpen, ShoppingCart, Edit, AlertTriangle } from 'lucide-react';
```

- [ ] **Step 12: Verify in browser**

Generate a mosaic (or use an existing session). Check:
- Tabs are plain text with gold underline on active
- Preview container is flat bordered box
- Stats show as flat panels with muted labels
- Shopping table uses thin dividers, no purple
- Download buttons are gold

- [ ] **Step 13: Commit**

```bash
git add frontend/src/components/ResultsTabs.tsx
git commit -m "feat: restyle ResultsTabs with editorial tabs, flat panels, and clean tables"
```

---

## Task 7: Restyle FeedbackWidget

**Files:**
- Modify: `frontend/src/components/FeedbackWidget.tsx`

- [ ] **Step 1: Replace FeedbackWidget.tsx**

Replace the full contents of `frontend/src/components/FeedbackWidget.tsx` with:

```tsx
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Check } from 'lucide-react';

interface FeedbackWidgetProps {
  sessionId: string;
}

export function FeedbackWidget({ sessionId }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFeedbackClick = (type: 'thumbs_up' | 'thumbs_down') => {
    setSelectedType(type);
    setIsOpen(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          feedback_type: selectedType,
          comment: comment.trim() || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit feedback');
      }
      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSelectedType(null);
        setComment('');
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedType(null);
    setComment('');
    setError('');
    setIsSubmitted(false);
  };

  if (!sessionId) return null;

  const thumbStyle = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? '#c4a882' : '#2e2a26'}`,
    background: '#242018',
    borderRadius: '2px',
    padding: '8px',
    cursor: 'pointer',
    color: active ? '#c4a882' : '#5a5450',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.15s, color 0.15s',
  });

  return (
    <>
      {!isOpen && !isSubmitted && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleFeedbackClick('thumbs_up')}
            style={thumbStyle(selectedType === 'thumbs_up')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a882'; }}
            onMouseLeave={e => { if (selectedType !== 'thumbs_up') (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2a26'; }}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleFeedbackClick('thumbs_down')}
            style={thumbStyle(selectedType === 'thumbs_down')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a882'; }}
            onMouseLeave={e => { if (selectedType !== 'thumbs_down') (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2a26'; }}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)' }}>
          <div className="panel" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#f5f0e8' }}>
                {selectedType === 'thumbs_up' ? 'Glad you like it!' : 'Help us improve'}
              </p>
              <button onClick={handleClose} style={{ color: '#5a5450', padding: '2px' }}>
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {isSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                <div style={{ border: '1px solid #2e2a26', borderRadius: '2px', padding: '12px' }}>
                  <Check className="w-5 h-5" style={{ color: '#c4a882' }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 300, color: '#c5bfb8' }}>Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5a5450', marginBottom: '8px' }}>
                    Tell us more (optional)
                  </p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value.slice(0, 200))}
                    placeholder="What did you think?"
                    rows={3}
                    maxLength={200}
                    style={{
                      width: '100%',
                      border: '1px solid #2e2a26',
                      borderRadius: '2px',
                      background: '#1c1917',
                      color: '#f5f0e8',
                      fontSize: '13px',
                      fontWeight: 300,
                      padding: '10px 12px',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  />
                  <p style={{ fontSize: '10px', fontWeight: 300, color: '#5a5450', marginTop: '4px' }}>
                    {comment.length}/200
                  </p>
                </div>

                {error && (
                  <p style={{ fontSize: '12px', color: '#e57373', marginBottom: '12px' }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleClose} className="btn-ghost flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-generate flex-1"
                  >
                    {isSubmitting ? 'Sending…' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify in browser**

After generating a mosaic, check:
- Thumbs buttons are flat bordered, muted icons
- Hovering turns border gold
- Clicking opens a flat modal (no blur background card)
- Submit button is gold, Cancel is ghost
- Submitted state shows a flat check panel

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/FeedbackWidget.tsx
git commit -m "feat: restyle FeedbackWidget with flat editorial modal"
```

---

## Task 8: Final Cleanup & Build Verification

**Files:**
- No new files — verification pass only

- [ ] **Step 1: Search for any remaining gradient/glass/purple classes**

```bash
grep -r "indigo\|purple\|pink\|glass\|backdrop-blur\|bg-gradient\|animate-float\|animate-bounce\|animate-pulse\|animate-in\|from-indigo\|from-purple" frontend/src --include="*.tsx" --include="*.css" -l
```

Expected: no files listed (or only LoginPage.tsx and DashboardPage.tsx if those are out of scope).

- [ ] **Step 2: If LoginPage.tsx or DashboardPage.tsx appear, note but don't fix**

These pages are out of scope for this redesign. Only note them for a follow-up.

- [ ] **Step 3: Run a production build**

```bash
cd frontend && npm run build
```

Expected: build completes with no TypeScript errors. Warnings about unused variables are acceptable.

- [ ] **Step 4: Visual smoke test — empty state**

Visit `http://localhost:5173` with the dev server running. Verify:
- Dark warm background `#1c1917` (no purple tint)
- Serif wordmark in nav
- Gold kicker + serif headline, italic gold "LEGO"
- Flat upload zone, circle icon, no glow
- Three setting chips below upload zone
- Gold generate button

- [ ] **Step 5: Visual smoke test — results state**

Upload an image and generate a mosaic. Verify:
- Hero disappears
- Results panel has plain-text tabs with gold underline
- Preview image in flat bordered box
- Stats as flat panels, no gradients
- Shopping list table uses thin dividers
- Download buttons are gold

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: complete editorial UI redesign — remove all gradients, glass, and purple"
```
