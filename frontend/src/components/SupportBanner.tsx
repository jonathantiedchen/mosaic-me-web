import { Coffee } from 'lucide-react';

export function SupportBanner() {
  return (
    <div className="glass-card p-4 sm:p-5 border-2 border-purple-500/30">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
            Enjoying Mosaic-Me?
          </h3>
          <p className="text-purple-200 text-xs sm:text-sm">
            Support & Connect!
          </p>
        </div>
        <a
          href="https://linktr.ee/jonathantie"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all font-medium text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95"
        >
          <Coffee className="w-4 h-4" />
          <span className="hidden sm:inline">Support</span>
        </a>
      </div>
    </div>
  );
}
