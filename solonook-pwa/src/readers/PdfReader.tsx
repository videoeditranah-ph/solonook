import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Configure worker
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export default function PdfReader({
  url,
  initialPage,
  onLocation
}: {
  url: string;
  initialPage: number;
  onLocation: (page: number) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [pdf, setPdf] = React.useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = React.useState<number>(Math.max(1, initialPage || 1));
  const [pageCount, setPageCount] = React.useState<number>(0);
  const [fitWidth, setFitWidth] = React.useState<boolean>(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const doc = await pdfjsLib.getDocument(url).promise;
      if (!alive) return;
      setPdf(doc);
      setPageCount(doc.numPages);
      const p = Math.min(Math.max(1, pageNum), doc.numPages);
      setPageNum(p);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  React.useEffect(() => {
    if (!pdf) return;
    renderPage(pdf, pageNum, canvasRef.current, fitWidth);
    onLocation(pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, pageNum, fitWidth]);

  function prev() { setPageNum(p => Math.max(1, p - 1)); }
  function next() { setPageNum(p => Math.min(pageCount || 1, p + 1)); }

  return (
    <div>
      <div className="row" style={{ padding: 12, justifyContent: 'space-between' }}>
        <div className="row">
          <button className="btn" onClick={prev} disabled={pageNum <= 1}>←</button>
          <div className="small">Page <b>{pageNum}</b> / {pageCount || '…'}</div>
          <button className="btn" onClick={next} disabled={pageCount ? pageNum >= pageCount : false}>→</button>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setFitWidth(v => !v)} title="Fit width toggle">
            {fitWidth ? 'Fit width' : 'Actual'}
          </button>
        </div>
      </div>

      <div className="pdfCanvasWrap">
        <canvas ref={canvasRef} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      <div className="small" style={{ padding: '0 12px 12px' }}>
        Tip: PDFs are fixed-layout, so font changes are limited. Use zoom + fit width + night mode (coming next).
      </div>
    </div>
  );
}

async function renderPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement | null,
  fitWidth: boolean
) {
  if (!canvas) return;
  const page = await pdf.getPage(pageNum);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const baseViewport = page.getViewport({ scale: 1.0 });
  const targetWidth = Math.min(window.innerWidth - 80, 880);
  const scale = fitWidth ? (targetWidth / baseViewport.width) : 1.3;
  const viewport = page.getViewport({ scale });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
}
