import { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';

export function SupportBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner with a slight delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="glass-card p-4 shadow-2xl border-2 border-purple-500/30">
        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Enjoying Mosaic-Me?
            </h3>
            <p className="text-purple-200 text-sm mb-3">
              This tool is free forever. Support the project or connect with me!
            </p>
            <a
              href="https://linktr.ee/jonathantie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
            >
              <Coffee className="w-4 h-4" />
              <span>Support & Connect</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
