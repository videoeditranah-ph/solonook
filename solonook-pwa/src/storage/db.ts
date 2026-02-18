import { openDB } from 'idb';
import type { Book, Doc, Note } from '../types';

const DB_NAME = 'solonook-db';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const books = db.createObjectStore('books', { keyPath: 'id' });
    books.createIndex('by_updatedAt', 'updatedAt');

    const docs = db.createObjectStore('docs', { keyPath: 'id' });
    docs.createIndex('by_bookId', 'bookId');
    docs.createIndex('by_updatedAt', 'updatedAt');

    const notes = db.createObjectStore('notes', { keyPath: 'id' });
    notes.createIndex('by_docId', 'docId');
    notes.createIndex('by_doc_loc', ['docId', 'locationKey']);
    notes.createIndex('by_updatedAt', 'updatedAt');
  },
});

export async function upsertBook(book: Book) {
  const db = await dbPromise;
  await db.put('books', book);
}

export async function listBooks(): Promise<Book[]> {
  const db = await dbPromise;
  return (await db.getAllFromIndex('books', 'by_updatedAt')).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getBook(id: string): Promise<Book | undefined> {
  const db = await dbPromise;
  return db.get('books', id);
}

export async function deleteBook(id: string) {
  const db = await dbPromise;
  // delete docs + notes belonging to the book
  const docs = await db.getAllFromIndex('docs', 'by_bookId', id);
  for (const d of docs) {
    await deleteDoc(d.id);
  }
  await db.delete('books', id);
}

export async function upsertDoc(doc: Doc) {
  const db = await dbPromise;
  await db.put('docs', doc);
}

export async function listDocsByBook(bookId: string): Promise<Doc[]> {
  const db = await dbPromise;
  const docs = await db.getAllFromIndex('docs', 'by_bookId', bookId);
  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDoc(id: string): Promise<Doc | undefined> {
  const db = await dbPromise;
  return db.get('docs', id);
}

export async function deleteDoc(id: string) {
  const db = await dbPromise;
  const notes = await db.getAllFromIndex('notes', 'by_docId', id);
  for (const n of notes) await db.delete('notes', n.id);
  await db.delete('docs', id);
}

export async function upsertNote(note: Note) {
  const db = await dbPromise;
  await db.put('notes', note);
}

export async function listNotesByDoc(docId: string): Promise<Note[]> {
  const db = await dbPromise;
  const notes = await db.getAllFromIndex('notes', 'by_docId', docId);
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await dbPromise;
  return db.get('notes', id);
}

export async function exportMetadataAndNotes(): Promise<{ books: Book[]; docs: Doc[]; notes: Note[]; exportedAt: number }> {
  const db = await dbPromise;
  const books = await db.getAll('books');
  const docs = await db.getAll('docs');
  const notes = await db.getAll('notes');
  return { books, docs, notes, exportedAt: Date.now() };
}

export async function importMetadataAndNotes(payload: { books: Book[]; docs: Doc[]; notes: Note[] }) {
  const db = await dbPromise;
  const tx = db.transaction(['books', 'docs', 'notes'], 'readwrite');
  for (const b of payload.books) await tx.objectStore('books').put(b);
  for (const d of payload.docs) await tx.objectStore('docs').put(d);
  for (const n of payload.notes) await tx.objectStore('notes').put(n);
  await tx.done;
}
