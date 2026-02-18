export function formatBytes(bytes: number): string {
  const units = ['B','KB','MB','GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

export async function pickFile(accept: string): Promise<File | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  return await new Promise((resolve) => {
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export async function pickImage(): Promise<File | null> {
  return pickFile('image/*');
}

export function now() { return Date.now(); }
