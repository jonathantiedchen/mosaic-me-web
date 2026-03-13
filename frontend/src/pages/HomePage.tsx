import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
<<<<<<< HEAD
import { AlertCircle, Sparkles } from 'lucide-react';
=======
import { AlertCircle, ArrowDown, Sparkles } from 'lucide-react';
>>>>>>> testing
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error, mosaicData, uploadedFile } = useMosaic();
  const hasResults = !!mosaicData;

  return (
<<<<<<< HEAD
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-between gap-4 sm:gap-6 lg:gap-8">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                    Mosaic-Me
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-purple-200 mt-0.5 sm:mt-1">
                    Transform your photos into LEGO mosaic artwork
                  </p>
                  <p className="text-xs sm:text-sm text-purple-300/80 mt-1 sm:mt-2">
                    100% Free • Your images are never stored
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {error && (
            <div className="mb-4 sm:mb-6 glass-card border-red-500/50 p-3 sm:p-4 lg:p-5 flex items-start gap-2 sm:gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
=======
    <div className="min-h-screen relative">
      <header className="border-b border-white/5 backdrop-blur-xl bg-white/[0.02] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
>>>>>>> testing
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Mosaic Me
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  LEGO mosaic generator
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {error && (
          <div className="mb-8 card border-red-500/30 p-6 flex items-start gap-4 animate-in slide-in-from-top duration-300">
            <div className="p-3 bg-red-500/10 rounded-xl backdrop-blur-xl">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-300">Error</h3>
              <p className="text-sm text-red-300/80 mt-1.5">{error}</p>
            </div>
          </div>
        )}

        {/* Hero when no upload */}
        {!uploadedFile && !hasResults && (
          <div className="mb-20 text-center relative">
            {/* Floating orbs */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>

            <div className="relative">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-intense border border-white/20 mb-8 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-lg shadow-indigo-400/50"></div>
                <span className="text-sm font-bold text-white">Free • No signup • Instant results</span>
              </div>

              <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  Transform photos
                </span>
                <span className="block text-white">
                  into LEGO art
                </span>
              </h2>

              <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                Upload any image to generate a complete LEGO mosaic with assembly instructions,
                shopping lists, and direct Pick-a-Brick import
              </p>

              <div className="inline-flex items-center gap-3 text-indigo-400 animate-bounce">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center backdrop-blur-xl border border-indigo-500/20">
                  <ArrowDown className="w-4 h-4" strokeWidth={3} />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Start creating</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload and Settings */}
        <div className="mb-16">
          <ConfigPanel />
        </div>

        {/* Results */}
        {hasResults && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full glass-intense border border-white/20 backdrop-blur-xl shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <Sparkles className="relative w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                </div>
                <span className="text-base font-black text-white uppercase tracking-wider">Your mosaic is ready!</span>
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
