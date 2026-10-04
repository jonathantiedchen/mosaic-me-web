import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { FeedbackWidget } from '../components/FeedbackWidget';
import { DownloadsCard } from '../components/DownloadsCard';
import { AlertCircle, Github } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

const SHOWCASE = [
  { src: '/showcase/living-room.jpg', title: 'Above the sofa', note: '48 × 48 · 38 cm' },
  { src: '/showcase/leaning.jpg', title: 'Leaning against the wall', note: '48 × 48 · 38 cm' },
  { src: '/showcase/shelf.jpg', title: 'On a picture ledge', note: '48 × 48 · 38 cm' },
];

const STEPS = [
  { title: 'Upload a photo', text: 'Any picture works. Choose a size from 26 to 102 cm and square or round plates.' },
  { title: 'Preview and tweak', text: 'See it in real rooms or in 3D, and repaint single studs in the editor.' },
  { title: 'Order and build', text: 'Download instructions and a parts list for LEGO Pick-a-Brick or BrickLink.' },
];

export function HomePage() {
  const { error, mosaicData } = useMosaic();
  const hasResults = !!mosaicData;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #2e2a26', height: '52px' }}
           className="flex items-center justify-between px-4 sm:px-7 flex-shrink-0">
        <span className="font-serif text-text-primary" style={{ fontSize: '17px' }}>
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        {/* Error */}
        {error && (
          <div role="alert" className="mb-8 panel p-5 flex items-start gap-4" style={{ borderColor: '#c0392b' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-error-light" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-error-light">Something went wrong</p>
              <p className="text-sm mt-1 text-error-light" style={{ fontWeight: 300 }}>{error}</p>
            </div>
          </div>
        )}

        {!hasResults ? (
          <>
            {/* Hero: one message, one action */}
            <section className="max-w-2xl mx-auto text-center pt-2 sm:pt-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div style={{ width: '20px', height: '1px', background: '#c4a882' }} />
                <span className="font-sans text-accent" style={{ fontWeight: 500, fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                  Free · No signup · Instant
                </span>
                <div style={{ width: '20px', height: '1px', background: '#c4a882' }} />
              </div>
              <h1 className="font-serif text-text-primary" style={{
                fontSize: 'clamp(44px, 8vw, 76px)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}>
                Turn photos into <em className="text-accent" style={{ fontStyle: 'italic' }}>LEGO</em> art.
              </h1>
              <p className="font-sans text-text-secondary mx-auto" style={{ fontWeight: 300, fontSize: '17px', lineHeight: 1.6, maxWidth: '480px', marginBottom: '36px' }}>
                Upload a photo and get a buildable mosaic, a preview of it in your home,
                and the parts list to order it.
              </p>
              <div className="text-left">
                <ConfigPanel />
              </div>
            </section>

            {/* Showcase: real renders at true scale sell the idea */}
            <section className="mt-24 sm:mt-32" aria-labelledby="showcase-title">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                <div>
                  <p className="chip-label" style={{ marginBottom: '10px' }}>See it before you build</p>
                  <h2 id="showcase-title" className="font-serif text-text-primary" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                    Real rooms. True scale.
                  </h2>
                </div>
                <p className="font-sans text-text-secondary" style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '360px' }}>
                  Every mosaic is previewed in real interior photos at its actual size, so you know how it will look before ordering a single brick.
                </p>
              </div>
              <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
                {SHOWCASE.map(({ src, title, note }) => (
                  <figure key={src} className="m-0">
                    <img
                      src={src}
                      alt={`A 48 × 48 LEGO mosaic ${title.toLowerCase()}`}
                      width={1000}
                      height={750}
                      loading="lazy"
                      className="w-full h-auto block border border-border"
                      style={{ borderRadius: '2px' }}
                    />
                    <figcaption className="flex items-baseline justify-between gap-3 mt-3">
                      <span className="font-sans text-text-subtle" style={{ fontSize: '14px' }}>{title}</span>
                      <span className="font-sans text-text-muted" style={{ fontSize: '12px' }}>{note}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section className="mt-24 sm:mt-28 border-t border-border pt-12" aria-label="How it works">
              <ol className="grid gap-10 sm:gap-8 sm:grid-cols-3">
                {STEPS.map(({ title, text }, i) => (
                  <li key={title}>
                    <span className="font-serif text-accent" style={{ fontSize: '28px', lineHeight: 1 }}>0{i + 1}</span>
                    <h3 className="font-sans text-text-primary" style={{ fontSize: '16px', fontWeight: 500, margin: '14px 0 8px' }}>{title}</h3>
                    <p className="font-sans text-text-secondary" style={{ fontSize: '14px', lineHeight: 1.65, fontWeight: 300 }}>{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : (
          /* Results: settings and downloads in a sidebar, the mosaic gets the room */
          <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
            <aside className="space-y-5 lg:sticky lg:top-6">
              <ConfigPanel />
              <DownloadsCard />
              {mosaicData?.sessionId && (
                <div className="panel p-4 flex flex-col items-center gap-3">
                  <p className="chip-label" style={{ marginBottom: 0 }}>How did we do?</p>
                  <FeedbackWidget sessionId={mosaicData.sessionId} />
                </div>
              )}
            </aside>
            {/* On phones the result comes first; settings follow below */}
            <section className="order-first lg:order-none min-w-0" aria-label="Your mosaic">
              <ResultsTabs />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2e2a26' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted" style={{ fontSize: '12px', fontWeight: 300 }}>
            <span className="font-serif text-text-secondary">Mosaic Me</span>
            {' '}· Made with care
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/jonathantiedchen/mosaic-me-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
              style={{ fontSize: '12px', fontWeight: 300 }}
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
              GitHub
            </a>
            <span className="text-text-muted" style={{ fontSize: '12px', fontWeight: 300 }}>
              Not affiliated with LEGO Group
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
