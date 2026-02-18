export type DocType = 'pdf' | 'epub';

export type Book = {
  id: string;
  title: string;
  coverDocId?: string; // points to a doc that is used as cover image (optional)
  coverUrl?: string;   // cached object URL (not persisted)
  createdAt: number;
  updatedAt: number;
};

export type Doc = {
  id: string;
  bookId: string;
  title: string;
  type: DocType;
  mime: string;
  size: number;
  opfsPath: string; // where the raw file is stored in OPFS
  createdAt: number;
  updatedAt: number;
  lastLocation?: string; // epub cfi or pdf page number stored as string
};

export type Note = {
  id: string;
  docId: string;
  locationKey: string; // 'doc' | 'pdf:12' | 'epub:<cfi>'
  title: string;
  html: string;
  updatedAt: number;
  createdAt: number;
};
