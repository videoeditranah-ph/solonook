import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage';
import BookPage from './pages/BookPage';
import ReaderPage from './pages/ReaderPage';
import { exportMetadataAndNotes, importMetadataAndNotes } from './storage/db';
import { downloadJson, pickFile } from './lib/utils';
import Toast from './components/Toast';

export default function App() {
  const [toast, setToast] = React.useState<string|null>(null);
  const nav = useNavigate();

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function onExport() {
    const payload = await exportMetadataAndNotes();
    downloadJson(`solonook-backup-${new Date().toISOString().slice(0,10)}.json`, payload);
    setToast('Exported backup (metadata + notes).');
  }

  async function onImport() {
    const file = await pickFile('application/json');
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed?.books || !parsed?.docs || !parsed?.notes) {
      setToast('Backup file not recognized.');
      return;
    }
    await importMetadataAndNotes({ books: parsed.books, docs: parsed.docs, notes: parsed.notes });
    setToast('Imported backup. Reloading…');
    setTimeout(() => nav(0), 400);
  }

  return (
    <div>
      <div className="container">
        <div className="card" style={{ padding: 14, borderRadius: 18 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <Link to="/" className="row" style={{ gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 12,
                  background: 'rgba(96,165,250,0.22)',
                  border: '1px solid rgba(96,165,250,0.35)',
                  display: 'flex', alignItems:'center', justifyContent:'center',
                  fontWeight: 800
                }}>S</div>
                <div>
                  <div className="h1">SoloNook Library</div>
                  <div className="h2">Offline reading • writing • organizing</div>
                </div>
              </Link>
            </div>
            <div className="row">
              <button className="btn" onClick={onExport}>Export backup</button>
              <button className="btn" onClick={onImport}>Import backup</button>
            </div>
          </div>
          <div className="small" style={{ marginTop: 10 }}>
            Tip: Install on Android Chrome → menu → <span className="kbd">Add to Home screen</span>.
            For true offline PWA install, host on HTTPS (GitHub Pages is free).
          </div>
        </div>

        <div style={{ height: 12 }} />

        <Routes>
          <Route path="/" element={<LibraryPage setToast={setToast} />} />
          <Route path="/book/:bookId" element={<BookPage setToast={setToast} />} />
          <Route path="/read/:docId" element={<ReaderPage setToast={setToast} />} />
        </Routes>
      </div>

      <Toast message={toast} />
    </div>
  );
}
