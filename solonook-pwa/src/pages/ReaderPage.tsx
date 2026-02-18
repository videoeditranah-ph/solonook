import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Doc, Note } from '../types';
import { getDoc, upsertDoc, listNotesByDoc, upsertNote } from '../storage/db';
import { readFileFromOpfs } from '../storage/opfs';
import { nanoid } from 'nanoid';
import { now } from '../lib/utils';

import PdfReader from '../readers/PdfReader';
import EpubReader from '../readers/EpubReader';
import WritingNook from '../writing/WritingNook';

export default function ReaderPage({ setToast }: { setToast: (s: string) => void }) {
  const { docId } = useParams();
  const [doc, setDoc] = React.useState<Doc | null>(null);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [activeLocKey, setActiveLocKey] = React.useState<string>('doc'); // 'pdf:12' or 'epub:<cfi>'

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!docId) return;
      const d = await getDoc(docId);
      if (!d) return;
      const f = await readFileFromOpfs(d.opfsPath);
      const url = URL.createObjectURL(f);

      if (!alive) return;
      setDoc(d);
      setFileUrl(url);
      setNotes(await listNotesByDoc(docId));
    })();
    return () => { alive = false; };
  }, [docId]);

  React.useEffect(() => {
    return () => { if (fileUrl) URL.revokeObjectURL(fileUrl); };
  }, [fileUrl]);

  async function updateLastLocation(lastLocation: string, locationKey: string) {
    if (!doc) return;
    const updated: Doc = { ...doc, lastLocation, updatedAt: now() };
    await upsertDoc(updated);
    setDoc(updated);
    setActiveLocKey(locationKey);
  }

  async function saveNote(html: string, title: string) {
    if (!docId) return;
    const existing = notes.find(n => n.locationKey === activeLocKey);
    const ts = now();
    const note: Note = existing ? {
      ...existing,
      html, title,
      updatedAt: ts,
    } : {
      id: nanoid(),
      docId,
      locationKey: activeLocKey,
      title,
      html,
      createdAt: ts,
      updatedAt: ts,
    };
    await upsertNote(note);
    const newNotes = await listNotesByDoc(docId);
    setNotes(newNotes);
    setToast('Saved note.');
  }

  if (!doc || !fileUrl) {
    return <div className="card" style={{ padding: 14 }}><div className="small">Loading…</div></div>;
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="h1">{doc.title}</div>
          <div className="small">{doc.type.toUpperCase()} • offline</div>
        </div>
        <div className="row">
          <Link className="btn" to={`/book/${doc.bookId}`}>← Back</Link>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="split">
        <div className="card readerFrame">
          <div className="row" style={{ padding: 12, justifyContent: 'space-between' }}>
            <div className="small">Reader</div>
            <div className="small">Last saved position: {doc.lastLocation ?? '—'}</div>
          </div>
          <div className="readerBody">
            {doc.type === 'pdf' ? (
              <PdfReader
                url={fileUrl}
                initialPage={doc.lastLocation ? Number(doc.lastLocation) : 1}
                onLocation={(page) => updateLastLocation(String(page), `pdf:${page}`)}
              />
            ) : (
              <EpubReader
                url={fileUrl}
                initialCfi={doc.lastLocation ?? null}
                onLocation={(cfi) => updateLastLocation(cfi, `epub:${cfi}`)}
              />
            )}
          </div>
        </div>

        <WritingNook
          doc={doc}
          notes={notes}
          activeLocKey={activeLocKey}
          onSave={saveNote}
          onSelectLocKey={(k) => setActiveLocKey(k)}
        />
      </div>
    </div>
  );
}
