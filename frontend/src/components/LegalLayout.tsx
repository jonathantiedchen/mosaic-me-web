import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

/** Shared frame for legal pages: nav back home, readable text column, footer. */
export function LegalLayout({ title, children }: LegalLayoutProps) {
  useEffect(() => {
    document.title = `${title} | Mosaic-Me`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav style={{ borderBottom: '1px solid #2e2a26', height: '52px' }}
           className="flex items-center justify-between px-4 sm:px-7 flex-shrink-0">
        <Link to="/" className="font-serif text-text-primary" style={{ fontSize: '17px' }}>
          Mosaic Me
        </Link>
        <Link to="/" className="text-text-muted hover:text-text-primary transition-colors" style={{ fontSize: '12px' }}>
          ← Back to the app
        </Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-serif text-text-primary mb-8" style={{ fontSize: '36px', lineHeight: 1.15 }}>
          {title}
        </h1>
        <div className="legal-prose">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Highlights text the site operator still has to fill in. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <mark className="bg-accent/20 text-accent px-1 rounded-sm" title="Fill in before publishing">
      [{children}]
    </mark>
  );
}
