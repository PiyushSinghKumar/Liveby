/**
 * Generates 5 launcher icon variants based on score level.
 * Each variant: different ring color + check state.
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const VARIANTS = [
  {
    name: 'score_none',   // no check-in yet
    ring: '#6366f1', check: '#ffffff', bg1: '#0d0d14', bg2: '#1a1a2e', opacity: 0.5,
  },
  {
    name: 'score_bad',    // 0-24 Are you kidding me
    ring: '#ef4444', check: '#ffffff', bg1: '#1a0808', bg2: '#2a0d0d', opacity: 1,
  },
  {
    name: 'score_poor',   // 25-49 Poor
    ring: '#f97316', check: '#ffffff', bg1: '#1a0f08', bg2: '#2a1608', opacity: 1,
  },
  {
    name: 'score_ok',     // 50-74 Bad
    ring: '#eab308', check: '#ffffff', bg1: '#141208', bg2: '#1f1c0a', opacity: 1,
  },
  {
    name: 'score_good',   // 75-99 Good
    ring: '#818cf8', check: '#ffffff', bg1: '#0d0d14', bg2: '#1a1a2e', opacity: 1,
  },
  {
    name: 'score_perfect', // 100 Perfect
    ring: '#10b981', check: '#ffffff', bg1: '#081a10', bg2: '#0d2a18', opacity: 1,
  },
]

function makeSVG({ ring, check, bg1, bg2, opacity }) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#bg)"/>
  <circle cx="50" cy="50" r="34" fill="none" stroke="${ring}" stroke-width="2" opacity="0.25"/>
  <circle cx="50" cy="50" r="34" fill="none" stroke="${ring}" stroke-width="5" opacity="${opacity}" filter="url(#glow)"/>
  <polyline points="32,50 44,63 68,36" fill="none" stroke="${check}" stroke-width="7"
    stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" filter="url(#glow)"/>
</svg>`
}

const sizes = {
  mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192
}

for (const variant of VARIANTS) {
  const svg = Buffer.from(makeSVG(variant))
  for (const [density, size] of Object.entries(sizes)) {
    const dir = resolve(root, `android/app/src/main/res/mipmap-${density}`)
    mkdirSync(dir, { recursive: true })
    await sharp(svg).resize(size, size).png()
      .toFile(resolve(dir, `ic_launcher_${variant.name}.png`))
    await sharp(svg).resize(size, size).png()
      .toFile(resolve(dir, `ic_launcher_${variant.name}_round.png`))
  }
  console.log(`✓ ${variant.name}`)
}

console.log('\n✅  Score icons generated')
