const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width / 2 - 1;

      if (dist <= radius) {
        // Mirai Gradient: Google Blue (#4285f4) to Emerald Green (#34a853)
        const t = (x + y) / (width + height);
        rawData[pxOffset] = Math.round(66 * (1 - t) + 52 * t);
        rawData[pxOffset + 1] = Math.round(133 * (1 - t) + 168 * t);
        rawData[pxOffset + 2] = Math.round(244 * (1 - t) + 83 * t);
        rawData[pxOffset + 3] = 255;
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const idat = chunk('IDAT', zlib.deflateSync(rawData));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) | 0;
}

const outDir = 'C:\\Users\\user\\.gemini\\antigravity\\scratch\\unified-search-extension\\icons';
[16, 48, 128].forEach((size) => {
  const png = createPng(size, size);
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), png);
  console.log(`Regenerated miraigoogle icon${size}.png`);
});
