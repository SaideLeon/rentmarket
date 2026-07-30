const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC_PRIMARY = path.join(__dirname, '../src/assets/images/quelimercado_icon_1785087884319.jpg');
const SRC_FALLBACK = path.join(__dirname, '../public/quelimercado_icon.jpg');
const SRC = fs.existsSync(SRC_PRIMARY) ? SRC_PRIMARY : SRC_FALLBACK;
const OUT = path.join(__dirname, '../public');

async function main() {
  console.log('Using source image:', SRC);

  // Ícones normais — redimensionamento directo, sem passar por texto
  await sharp(SRC).resize(192, 192).png().toFile(path.join(OUT, 'icon-192.png'));
  await sharp(SRC).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));
  await sharp(SRC).resize(512, 512).png().toFile(path.join(OUT, 'icon.png'));

  // Apple touch icon — sem canal alpha
  await sharp(SRC)
    .resize(180, 180)
    .flatten({ background: '#ffffff' })
    .png()
    .toFile(path.join(OUT, 'apple-touch-icon.png'));

  // Maskable — logótipo a 72% do canvas, centrado, fundo branco até à borda
  const canvas = 512;
  const inner = Math.round(canvas * 0.72);
  const offset = Math.round((canvas - inner) / 2);

  const logoBuffer = await sharp(SRC).resize(inner, inner).png().toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([{ input: logoBuffer, left: offset, top: offset }])
    .png()
    .toFile(path.join(OUT, 'maskable-icon-512.png'));

  console.log('Ícones PWA gerados com sucesso.');
}

main().catch((err) => {
  console.error('Falha ao gerar ícones:', err);
  process.exit(1);
});
