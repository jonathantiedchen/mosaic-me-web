import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { SupportBanner } from '../components/SupportBanner';
import { AlertCircle, Sparkles, ArrowDown } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error, mosaicData, uploadedFile } = useMosaic();
  const hasResults = !!mosaicData;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
                    100% Free • Tips appreciated • Your images are never stored
                  </p>
                </div>
              </div>
              <div className="hidden md:block flex-shrink-0">
                <SupportBanner />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
          {error && (
            <div className="mb-6 sm:mb-8 glass-card border-red-500/50 p-3 sm:p-4 lg:p-5 flex items-start gap-2 sm:gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-red-300">Error</h3>
                <p className="text-xs sm:text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Hero section when no image */}
          {!uploadedFile && !hasResults && (
            <div className="text-center mb-8 sm:mb-12 animate-in fade-in duration-500">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                Create Your LEGO Mosaic
              </h2>
              <p className="text-sm sm:text-base text-purple-200 max-w-2xl mx-auto mb-6">
                Upload any image and watch it transform into a beautiful LEGO mosaic.
                Get instructions, shopping lists, and Pick-a-Brick files instantly.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-300 animate-bounce">
                <ArrowDown className="w-5 h-5" />
                <span className="text-sm font-semibold">Start here</span>
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Upload and Settings Panel */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <ConfigPanel />
          </div>

          {/* Results Section - Only show when mosaic data exists */}
          {hasResults && (
            <div className="animate-in slide-in-from-bottom duration-700 ease-out">
              <div className="mb-4 sm:mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-semibold text-purple-200">Your Mosaic is Ready!</span>
                </div>
              </div>
              <ResultsTabs />
            </div>
          )}
        </main>

        <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 mt-12 sm:mt-16 lg:mt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-purple-200 text-center">
              Mosaic-Me v1.0.0 | Not affiliated with LEGO Group
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
