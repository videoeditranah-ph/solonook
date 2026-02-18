import React from 'react';
import ReactQuill from 'react-quill';
import type { Doc, Note } from '../types';

export default function WritingNook({
  doc,
  notes,
  activeLocKey,
  onSave,
  onSelectLocKey
}: {
  doc: Doc;
  notes: Note[];
  activeLocKey: string;
  onSave: (html: string, title: string) => Promise<void>;
  onSelectLocKey: (k: string) => void;
}) {
  const active = notes.find(n => n.locationKey === activeLocKey) ?? null;

  const [title, setTitle] = React.useState<string>(active?.title ?? defaultTitle(activeLocKey));
  const [html, setHtml] = React.useState<string>(active?.html ?? '');

  React.useEffect(() => {
    const n = notes.find(x => x.locationKey === activeLocKey) ?? null;
    setTitle(n?.title ?? defaultTitle(activeLocKey));
    setHtml(n?.html ?? '');
  }, [activeLocKey, notes]);

  const toolbar = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ];

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Writing Nook</div>
            <div className="small">Notes are tied to your current page/chapter location.</div>
          </div>
          <button className="btn primary" onClick={() => onSave(html, title)}>Save</button>
        </div>

        <div style={{ height: 10 }} />

        <input
          className="input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title…"
          style={{ width: '100%' }}
        />

        <div style={{ height: 10 }} />

        <div className="small">Current anchor: <span className="kbd">{activeLocKey}</span></div>
      </div>

      <div style={{ padding: 12, paddingTop: 0 }}>
        <div className="card" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <ReactQuill
            theme="snow"
            value={html}
            onChange={setHtml}
            modules={{ toolbar }}
          />
        </div>
      </div>

      <div style={{ padding: 12, paddingTop: 0 }}>
        <div className="small" style={{ marginBottom: 8 }}>All notes for this document</div>
        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
          {notes.length === 0 ? (
            <div className="small" style={{ padding: 10 }}>No notes yet.</div>
          ) : (
            notes.map(n => (
              <button
                key={n.id}
                className="btn"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: n.locationKey === activeLocKey ? 'rgba(96,165,250,0.16)' : 'transparent'
                }}
                onClick={() => onSelectLocKey(n.locationKey)}
                title={n.locationKey}
              >
                <div style={{ fontWeight: 650 }}>{n.title || '(untitled)'}</div>
                <div className="small">{new Date(n.updatedAt).toLocaleString()}</div>
              </button>
            ))
          )}
        </div>

        <div className="small" style={{ marginTop: 10 }}>
          For PDFs, anchors look like <span className="kbd">pdf:12</span>. For EPUBs: <span className="kbd">epub:&lt;cfi&gt;</span>.
        </div>
      </div>
    </div>
  );
}

function defaultTitle(locKey: string) {
  if (locKey === 'doc') return 'General note';
  return `Note @ ${locKey}`;
}
