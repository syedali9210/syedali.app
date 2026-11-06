// Writes src/content/media.json: { "/case-studies/x.webp": [width, height] } for every picture in public/,
// so pages reserve each image's exact box before it loads. Run after adding pictures: npm run media
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import assert from "node:assert";

export function size(buf) {
  // PNG: IHDR right after the 8-byte signature
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  // WebP: RIFF....WEBP then VP8 / VP8L / VP8X
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") {
      const b = buf.readUInt32LE(21);
      return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
    }
    if (kind === "VP8X") return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  // JPEG: walk the markers to the first start-of-frame
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}

const root = "public";
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

if (process.argv[1].endsWith("media.mjs")) {
  const out = {};
  for (const file of walk(root)) {
    if (![".png", ".webp", ".jpg", ".jpeg"].includes(extname(file).toLowerCase())) continue;
    const dims = size(readFileSync(file));
    assert(dims, `can't read the size of ${file}`);
    out["/" + relative(root, file).replaceAll("\\", "/")] = dims;
  }
  // Self-check against a picture whose size is known.
  assert.deepEqual(out["/case-studies/trace/timeline.webp"], [2260, 1260]);
  writeFileSync("src/content/media.json", JSON.stringify(out, null, 1) + "\n");
  console.log(`media.json: ${Object.keys(out).length} pictures`);
}
