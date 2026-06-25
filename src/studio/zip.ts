// Minimal, dependency-free ZIP writer (STORE method — no compression).
// Enough to bundle the project's text files into a downloadable .zip that any
// OS unzips natively. Keeping it hand-rolled avoids adding a runtime dependency
// to the single self-contained panel bundle.

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let b = 0; b < 8; b++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (~crc) >>> 0;
}

const u16 = (n: number) => [n & 0xff, (n >>> 8) & 0xff];
const u32 = (n: number) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

/** Build a STORE-method ZIP from path→text entries. */
export function zipSync(files: Record<string, string>): Blob {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: number[] = [];
  const names = Object.keys(files).sort();
  let offset = 0;

  for (const name of names) {
    const nameBytes = enc.encode(name);
    const data = enc.encode(files[name]);
    const crc = crc32(data);

    const localHeader = [
      0x50, 0x4b, 0x03, 0x04, // local file header signature
      ...u16(20), // version needed to extract
      ...u16(0), // general purpose flag
      ...u16(0), // compression method: 0 = store
      ...u16(0), ...u16(0x21), // mod time, mod date (1980-01-01)
      ...u32(crc),
      ...u32(data.length), // compressed size
      ...u32(data.length), // uncompressed size
      ...u16(nameBytes.length),
      ...u16(0), // extra field length
      ...nameBytes,
    ];
    parts.push(new Uint8Array(localHeader), data);

    central.push(
      0x50, 0x4b, 0x01, 0x02, // central directory header signature
      ...u16(20), ...u16(20), // version made by / needed
      ...u16(0), ...u16(0), // flag, method
      ...u16(0), ...u16(0x21), // mod time, date (1980-01-01)
      ...u32(crc),
      ...u32(data.length), ...u32(data.length),
      ...u16(nameBytes.length),
      ...u16(0), ...u16(0), // extra, comment length
      ...u16(0), ...u16(0), // disk number, internal attrs
      ...u32(0), // external attrs
      ...u32(offset), // relative offset of local header
      ...nameBytes,
    );
    offset += localHeader.length + data.length;
  }

  const centralBytes = new Uint8Array(central);
  const eocd = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, // end of central directory signature
    ...u16(0), ...u16(0), // disk numbers
    ...u16(names.length), ...u16(names.length), // entries on disk / total
    ...u32(centralBytes.length),
    ...u32(offset),
    ...u16(0), // comment length
  ]);

  parts.push(centralBytes, eocd);
  return new Blob(parts, { type: 'application/zip' });
}

/** Trigger a browser download of `files` as a single .zip. */
export function downloadZip(files: Record<string, string>, filename = 'dashboard.zip'): void {
  const url = URL.createObjectURL(zipSync(files));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Append to the top-level document so the click reliably triggers a download
  // even though the app itself lives in a shadow root.
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
