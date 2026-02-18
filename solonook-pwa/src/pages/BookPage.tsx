import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import type { Doc, DocType } from '../types';
import { getBook, listDocsByBook, upsertDoc, upsertBook, deleteDoc } from '../storage/db';
import { writeFileToOpfs, deleteOpfsPath, readFileFromOpfs } from '../storage/opfs';
import { now, pickFile } from '../lib/utils';
import { formatBytes } from '../lib/utils';

export default function BookPage({ setToast }: { setToast: (s: string) => void }) {
  const { bookId } = useParams();
  const [bookTitle, setBookTitle] = React.useState<string>('…');
  const [docs, setDocs] = React.useState<Doc[]>([]);

  async function refresh() {
    if (!bookId) return;
    const b = await getBook(bookId);
    setBookTitle(b?.title ?? '(missing)');
    setDocs(await listDocsByBook(bookId));
  }

  React.useEffect(() => { refresh(); }, [bookId]);

  async function renameFolder() {
    if (!bookId) return;
    const b = await getBook(bookId);
    if (!b) return;
    const t = prompt('Rename folder/book:', b.title);
    if (!t) return;
    await upsertBook({ ...b, title: t.trim(), updatedAt: now() });
    setToast('Renamed.');
    refresh();
  }

  async function importDoc(type: DocType) {
    if (!bookId) return;
    const accept = type === 'pdf' ? 'application/pdf' : 'application/epub+zip,.epub';
    const file = await pickFile(accept);
    if (!file) return;

    const id = nanoid();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const opfsPath = `docs/${id}-${safeName}`;
    await writeFileToOpfs(opfsPath, file);

    const ts = now();
    const doc: Doc = {
      id,
      bookId,
      title: file.name.replace(/\.(pdf|epub)$/i, ''),
      type,
      mime: file.type || (type === 'pdf' ? 'application/pdf' : 'application/epub+zip'),
      size: file.size,
      opfsPath,
      createdAt: ts,
      updatedAt: ts,
    };
    await upsertDoc(doc);
    setToast(`Imported ${type.toUpperCase()}.`);
    refresh();
  }

  async function setFolderCoverFromDoc(doc: Doc) {
    if (!bookId) return;
    const b = await getBook(bookId);
    if (!b) return;
    // Simple cover strategy:
    // - For PDFs: use first page snapshot would be nice, but that's extra work.
    // - Here: let user pick a cover in Library page; for convenience, we set a "coverDocId" pointer only.
    await upsertBook({ ...b, coverDocId: doc.id, updatedAt: now() });
    setToast('Cover linked to a document (note: this build uses manual image covers in Library).');
    refresh();
  }

  async function remove(doc: Doc) {
    if (!confirm('Delete this document and its notes?')) return;
    await deleteDoc(doc.id);
    await deleteOpfsPath(doc.opfsPath).catch(() => {});
    setToast('Deleted document.');
    refresh();
  }

  async function downloadDoc(doc: Doc) {
    const file = await readFileFromOpfs(doc.opfsPath);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = `${doc.title}.${doc.type}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="h1">{bookTitle}</div>
          <div className="small">Import PDFs/EPUBs here. Everything is stored locally on your phone.</div>
        </div>
        <div className="row">
          <Link className="btn" to="/">← Library</Link>
          <button className="btn" onClick={renameFolder}>Rename</button>
          <button className="btn primary" onClick={() => importDoc('pdf')}>+ PDF</button>
          <button className="btn primary" onClick={() => importDoc('epub')}>+ EPUB</button>
        </div>
      </div>

      <hr className="hr" />

      {docs.length === 0 ? (
        <div className="small">No documents yet. Add a PDF or EPUB.</div>
      ) : (
        <div className="grid">
          {docs.map(d => (
            <div className="tile" key={d.id}>
              <Link to={`/read/${d.id}`}>
                <div className="cover">
                  <div style={{ textAlign:'center', padding: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{d.type.toUpperCase()}</div>
                    <div className="small" style={{ marginTop: 6 }}>{formatBytes(d.size)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontWeight: 650 }}>{d.title}</div>
                <div className="small">Updated {new Date(d.updatedAt).toLocaleString()}</div>
              </Link>

              <div className="row" style={{ marginTop: 10, justifyContent:'space-between' }}>
                <button className="btn" onClick={() => downloadDoc(d)}>Export file</button>
                <button className="btn" onClick={() => setFolderCoverFromDoc(d)}>Use as cover</button>
                <button className="btn danger" onClick={() => remove(d)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="hr" />
      <div className="small">
        Coming next: “Merge PDFs into one Book PDF” (requires reading PDF pages and re-writing a combined PDF).
        This starter focuses on offline library + reader + writing nook first.
      </div>
    </div>
  );
}
