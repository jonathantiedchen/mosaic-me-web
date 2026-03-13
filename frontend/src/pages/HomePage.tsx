import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { SupportBanner } from '../components/SupportBanner';
import { AlertCircle, ArrowDown } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error, mosaicData, uploadedFile } = useMosaic();
  const hasResults = !!mosaicData;

  return (
    <div className="min-h-screen">
      <header className="border-b border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-50 tracking-tight">
                Mosaic Me
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                LEGO mosaic generator
              </p>
            </div>
            <div className="hidden md:block">
              <SupportBanner />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {error && (
          <div className="mb-6 card border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Hero when no upload */}
        {!uploadedFile && !hasResults && (
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-50 mb-3 tracking-tight">
              Turn your photos into <span className="text-brand">LEGO</span> mosaics
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mb-8">
              Upload any image to generate a buildable LEGO mosaic. Get assembly instructions,
              shopping lists, and direct Pick-a-Brick import files.
            </p>
            <div className="flex items-center gap-2 text-gray-600">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">Start below</span>
            </div>
          </div>
        )}

        {/* Upload and Settings */}
        <div className="mb-12">
          <ConfigPanel />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/[0.08]"></div>
              <span className="text-xs font-medium text-gray-500">RESULTS</span>
              <div className="h-px flex-1 bg-white/[0.08]"></div>
            </div>
            <ResultsTabs />
          </div>
        )}
      </main>

      <footer className="border-t border-subtle mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs text-gray-600 text-center">
            Mosaic Me • Not affiliated with LEGO Group
          </p>
        </div>
      </footer>
    </div>
  );
}
