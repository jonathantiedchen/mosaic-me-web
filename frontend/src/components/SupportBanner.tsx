import { Coffee } from 'lucide-react';

export function SupportBanner() {
  return (
    <div className="glass-card p-3 border-2 border-purple-500/30">
      <a
        href="https://linktr.ee/jonathantie"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Coffee className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm group-hover:text-purple-200 transition-colors">
            Support & Connect
          </p>
        </div>
      </a>
    </div>
  );
}
