import { ConfigPanel } from '../components/ConfigPanel';
import { ResultsTabs } from '../components/ResultsTabs';
import { SupportBanner } from '../components/SupportBanner';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

export function HomePage() {
  const { error } = useMosaic();

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
              <div>
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
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {error && (
            <div className="mb-4 sm:mb-6 glass-card border-red-500/50 p-3 sm:p-4 lg:p-5 flex items-start gap-2 sm:gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-red-300">Error</h3>
                <p className="text-xs sm:text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <ConfigPanel />
              <SupportBanner />
            </div>
            <div className="lg:col-span-2">
              <ResultsTabs />
            </div>
          </div>
        </main>

        <footer className="backdrop-blur-sm bg-white/5 border-t border-white/10 mt-8 sm:mt-12 lg:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-purple-200 text-center">
              Mosaic-Me v1.0.0 | Not affiliated with LEGO Group
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
