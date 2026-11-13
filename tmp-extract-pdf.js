const fs = require('fs');
const zlib = require('zlib');

function ascii85Decode(input) {
  let s = input.replace(/\s+/g, '').replace(/~>$/, '');
  let out = Buffer.alloc(0);
  let i = 0;
  while (i < s.length) {
    if (s[i] === 'z') {
      out = Buffer.concat([out, Buffer.alloc(4)]);
      i += 1;
      continue;
    }
    const chunk = s.slice(i, i + 5);
    const pad = 5 - chunk.length;
    const padded = chunk + 'u'.repeat(pad);
    let n = 0;
    for (let j = 0; j < 5; j++) n = n * 85 + (padded.charCodeAt(j) - 33);
    const bytes = Buffer.from([
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255,
    ]);
    out = Buffer.concat([out, bytes.slice(0, 4 - pad)]);
    i += chunk.length;
  }
  return out;
}

const pdf = fs.readFileSync('C:/Users/vidhi/Downloads/Bookstore_API_Infinite_Scroll_Guide.pdf', 'latin1');
const streams = [...pdf.matchAll(/stream\r?\n([\s\S]*?)endstream/g)].map((m) => m[1]);
let text = '';
for (const stream of streams) {
  try {
    const decoded = ascii85Decode(stream.trim());
    const inflated = zlib.inflateSync(decoded).toString('utf8');
    const strings = [...inflated.matchAll(/\((?:\\.|[^\\)])*\)/g)].map((m) =>
      m[0]
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
    );
    text += strings.join('') + '\n\n---PAGE---\n\n';
  } catch (e) {
    text += 'DECODE ERROR: ' + e.message + '\n';
  }
}
fs.writeFileSync('tmp-pdf-text.txt', text);
console.log(text);
