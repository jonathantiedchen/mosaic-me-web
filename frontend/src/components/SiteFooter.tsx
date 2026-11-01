import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const LINK_CLASS = 'text-text-muted hover:text-text-primary transition-colors';
const SMALL = { fontSize: '12px', fontWeight: 300 } as const;

export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid #2e2a26' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-text-muted" style={SMALL}>
          <span className="font-serif text-text-secondary">Mosaic Me</span>
          {' '}· Made with care
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/privacy" className={LINK_CLASS} style={SMALL}>Privacy</Link>
          <a
            href="https://github.com/jonathantiedchen/mosaic-me-web"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 ${LINK_CLASS}`}
            style={SMALL}
          >
            <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
            GitHub
          </a>
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 text-center sm:text-left text-text-muted" style={{ fontSize: '11px', fontWeight: 300 }}>
        LEGO® is a trademark of the LEGO Group, which does not sponsor, authorize or endorse this site.
        Mosaic-Me is an independent, non-commercial project and is not affiliated with the LEGO Group or BrickLink.
      </p>
    </footer>
  );
}
