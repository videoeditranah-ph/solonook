import React from 'react';
import { Link } from 'react-router-dom';
import { nanoid } from 'nanoid';
import type { Book } from '../types';
import { listBooks, upsertBook, deleteBook } from '../storage/db';
import { now, pickImage } from '../lib/utils';

export default function LibraryPage({ setToast }: { setToast: (s: string) => void }) {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [title, setTitle] = React.useState('');

  async function refresh() {
    setBooks(await listBooks());
  }

  React.useEffect(() => { refresh(); }, []);

  async function createBook() {
    const t = title.trim();
    if (!t) return;
    const ts = now();
    const book: Book = { id: nanoid(), title: t, createdAt: ts, updatedAt: ts };
    await upsertBook(book);
    setTitle('');
    setToast('Created a new folder/book.');
    refresh();
  }

  async function setCover(book: Book) {
    const img = await pickImage();
    if (!img) return;
    // store cover as a data URL in metadata for simplicity (works for personal use).
    // If you prefer: store image in OPFS too.
    const dataUrl = await fileToDataUrl(img);
    const updated: Book = { ...book, coverUrl: dataUrl, updatedAt: now() };
    await upsertBook(updated);
    setToast('Updated cover.');
    refresh();
  }

  async function remove(bookId: string) {
    if (!confirm('Delete this folder/book and its documents + notes?')) return;
    await deleteBook(bookId);
    setToast('Deleted folder/book.');
    refresh();
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="h1">Your Library</div>
          <div className="small">Folders behave like books. Each can have a custom cover.</div>
        </div>
        <div className="row">
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="New folder/book name…" />
          <button className="btn primary" onClick={createBook}>Create</button>
        </div>
      </div>

      <hr className="hr" />

      {books.length === 0 ? (
        <div className="small">No folders yet. Create one above.</div>
      ) : (
        <div className="grid">
          {books.map(b => (
            <div className="tile" key={b.id}>
              <Link to={`/book/${b.id}`}>
                <div className="cover">
                  {b.coverUrl ? <img src={b.coverUrl} alt="" /> : <div className="small">No cover</div>}
                </div>
                <div style={{ marginTop: 10, fontWeight: 650 }}>{b.title}</div>
                <div className="small">Updated {new Date(b.updatedAt).toLocaleString()}</div>
              </Link>

              <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
                <button className="btn" onClick={() => setCover(b)}>Set cover</button>
                <button className="btn danger" onClick={() => remove(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
