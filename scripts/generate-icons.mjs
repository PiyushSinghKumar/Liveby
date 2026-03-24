import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svg = readFileSync(resolve(root, 'logo.svg'))

async function icon(size, dest) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(root, dest))
  console.log(`✓ ${size}x${size} → ${dest}`)
}

// Android
await icon(48,  'android/app/src/main/res/mipmap-mdpi/ic_launcher.png')
await icon(48,  'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png')
await icon(72,  'android/app/src/main/res/mipmap-hdpi/ic_launcher.png')
await icon(72,  'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png')
await icon(96,  'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png')
await icon(96,  'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png')
await icon(144, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png')
await icon(144, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png')
await icon(192, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')
await icon(192, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png')

// Android foreground (same as launcher for simplicity)
await icon(108, 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png')
await icon(162, 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png')
await icon(216, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png')
await icon(324, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png')
await icon(432, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png')

// iOS
await icon(1024, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')

console.log('\n✅  All icons generated from logo.svg')
