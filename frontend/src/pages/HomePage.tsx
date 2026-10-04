import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { FeedbackWidget } from '../components/FeedbackWidget';
import { DownloadsCard } from '../components/DownloadsCard';
import { HeroVisual } from '../components/HeroVisual';
import { AlertCircle, Github } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

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
          /* Landing: pitch + form on the left, the payoff on the right */
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: '20px', height: '1px', background: '#c4a882', flexShrink: 0 }} />
                  <span className="font-sans text-accent" style={{
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                  }}>
                    Free · No signup · Instant
                  </span>
                </div>
                <h1 className="font-serif text-text-primary" style={{
                  fontSize: 'clamp(40px, 6vw, 60px)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  marginBottom: '16px',
                }}>
                  Turn photos into{' '}
                  <em className="text-accent" style={{ fontStyle: 'italic' }}>LEGO</em>
                  {' '}art.
                </h1>
                <p className="font-sans text-text-secondary" style={{
                  fontWeight: 300,
                  fontSize: '15px',
                  lineHeight: 1.65,
                  maxWidth: '420px',
                }}>
                  Upload any image to get a buildable LEGO mosaic: see it on your wall, then download
                  instructions and a parts list for Pick-a-Brick or BrickLink.
                </p>
              </div>
              <ConfigPanel />
            </div>
            <HeroVisual />
          </div>
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
