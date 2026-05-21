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
