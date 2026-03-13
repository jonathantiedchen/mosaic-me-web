import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { AlertCircle, ArrowDown, Sparkles } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error, mosaicData, uploadedFile } = useMosaic();
  const hasResults = !!mosaicData;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Mosaic Me
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Turn photos into LEGO art
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {error && (
          <div className="mb-8 card border-red-500/30 p-5 flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-300">Error</h3>
              <p className="text-sm text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Hero when no upload */}
        {!uploadedFile && !hasResults && (
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 border border-blue-500/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-300">Free • No signup • Instant</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Transform photos into
              </span>
              <br />
              <span className="text-white">buildable LEGO art</span>
            </h2>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any image to generate a complete LEGO mosaic with assembly instructions,
              shopping lists, and direct Pick-a-Brick import.
            </p>

            <div className="flex items-center justify-center gap-2 text-blue-400 animate-bounce">
              <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-sm font-semibold">Get started</span>
            </div>
          </div>
        )}

        {/* Upload and Settings */}
        <div className="mb-16">
          <ConfigPanel />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">Your mosaic is ready!</span>
              </div>
            </div>
            <ResultsTabs />
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-24 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Mosaic Me</span>
              {' '}• Made with care
            </p>
            <p className="text-xs text-gray-500">
              Not affiliated with LEGO Group
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
