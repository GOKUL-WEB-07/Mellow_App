import sharp from "sharp";
import { readFile } from "node:fs/promises";
const source = process.argv[2];
if (source)
  await sharp(source)
    .resize({ width: 1440, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile("public/room.webp");
const svg = await readFile("public/icon.svg");
for (const size of [192, 512])
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
