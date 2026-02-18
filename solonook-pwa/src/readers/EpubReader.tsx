import React from 'react';
import ePub, { Book, Rendition } from 'epubjs';

export default function EpubReader({
  url,
  initialCfi,
  onLocation
}: {
  url: string;
  initialCfi: string | null;
  onLocation: (cfi: string) => void;
}) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const bookRef = React.useRef<Book | null>(null);
  const rendRef = React.useRef<Rendition | null>(null);

  const [fontSize, setFontSize] = React.useState<number>(110);
  const [theme, setTheme] = React.useState<'light'|'sepia'|'dark'>('dark');

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!hostRef.current) return;

      // clean
      hostRef.current.innerHTML = '';

      const book = ePub(url);
      bookRef.current = book;

      const rendition = book.renderTo(hostRef.current, {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'none'
      });
      rendRef.current = rendition;

      // Themes
      rendition.themes.register('light', { body: { background: '#ffffff', color: '#111827' }});
      rendition.themes.register('sepia', { body: { background: '#f3e7d3', color: '#1f2937' }});
      rendition.themes.register('dark',  { body: { background: '#0b1020', color: '#e5e7eb' }});
      rendition.themes.select(theme);
      rendition.themes.fontSize(`${fontSize}%`);

      rendition.on('relocated', (loc: any) => {
        if (!alive) return;
        const cfi = loc?.start?.cfi;
        if (cfi) onLocation(cfi);
      });

      await rendition.display(initialCfi ?? undefined);
    })();

    return () => {
      alive = false;
      try { rendRef.current?.destroy(); } catch {}
      try { bookRef.current?.destroy(); } catch {}
      rendRef.current = null;
      bookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  React.useEffect(() => {
    if (!rendRef.current) return;
    rendRef.current.themes.fontSize(`${fontSize}%`);
  }, [fontSize]);

  React.useEffect(() => {
    if (!rendRef.current) return;
    rendRef.current.themes.select(theme);
  }, [theme]);

  function prev() { rendRef.current?.prev(); }
  function next() { rendRef.current?.next(); }

  return (
    <div style={{ height: '100%' }}>
      <div className="row" style={{ padding: 12, justifyContent: 'space-between' }}>
        <div className="row">
          <button className="btn" onClick={prev}>←</button>
          <button className="btn" onClick={next}>→</button>
        </div>
        <div className="row">
          <label className="small">Size</label>
          <input
            type="range"
            min={85}
            max={160}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <select className="select" value={theme} onChange={e => setTheme(e.target.value as any)}>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
      <div ref={hostRef} style={{ height: 'calc(100% - 58px)' }} />
    </div>
  );
}
