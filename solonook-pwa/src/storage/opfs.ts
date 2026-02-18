/**
 * OPFS = Origin Private File System (good for large offline files).
 * Works well on Android Chrome.
 */
export async function opfsRoot(): Promise<FileSystemDirectoryHandle> {
  // @ts-ignore
  return await navigator.storage.getDirectory();
}

export async function writeFileToOpfs(path: string, file: File): Promise<void> {
  const root = await opfsRoot();
  const parts = path.split('/').filter(Boolean);
  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: true });
  }
  const name = parts[parts.length - 1];
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();
}

export async function readFileFromOpfs(path: string): Promise<File> {
  const root = await opfsRoot();
  const parts = path.split('/').filter(Boolean);
  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: false });
  }
  const name = parts[parts.length - 1];
  const handle = await dir.getFileHandle(name, { create: false });
  return await handle.getFile();
}

export async function deleteOpfsPath(path: string): Promise<void> {
  const root = await opfsRoot();
  const parts = path.split('/').filter(Boolean);
  let dir: FileSystemDirectoryHandle = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create: false });
  }
  await dir.removeEntry(parts[parts.length - 1]);
}

export async function listOpfsFiles(prefixDir = 'docs'): Promise<string[]> {
  const root = await opfsRoot();
  let dir = root;
  try {
    dir = await root.getDirectoryHandle(prefixDir, { create: false });
  } catch {
    return [];
  }
  const out: string[] = [];
  // @ts-ignore
  for await (const [name, handle] of dir.entries()) {
    // @ts-ignore
    if (handle.kind === 'file') out.push(`${prefixDir}/${name}`);
  }
  return out;
}
