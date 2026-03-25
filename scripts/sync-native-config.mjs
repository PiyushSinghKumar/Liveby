/**
 * Reads lib/config.ts and propagates appName + appId into Android native files.
 * Run automatically as part of `just install` / `just apk`.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src  = readFileSync(resolve(root, 'lib/config.ts'), 'utf8')

function extract(key) {
  const m = src.match(new RegExp(`${key}:\\s*['"\`]([^'"\`]+)['"\`]`))
  if (!m) throw new Error(`Could not find "${key}" in lib/config.ts`)
  return m[1]
}

const appName = extract('appName')
const appId   = extract('appId')

// ── strings.xml ────────────────────────────────────────────────────────────
const stringsPath = resolve(root, 'android/app/src/main/res/values/strings.xml')
let strings = readFileSync(stringsPath, 'utf8')
strings = strings
  .replace(/(<string name="app_name">)[^<]*/,           `$1${appName}`)
  .replace(/(<string name="title_activity_main">)[^<]*/, `$1${appName}`)
  .replace(/(<string name="package_name">)[^<]*/,        `$1${appId}`)
  .replace(/(<string name="custom_url_scheme">)[^<]*/,   `$1${appId}`)
writeFileSync(stringsPath, strings)
console.log(`✓ strings.xml  - name="${appName}"  id="${appId}"`)

// ── build.gradle ───────────────────────────────────────────────────────────
const gradlePath = resolve(root, 'android/app/build.gradle')
let gradle = readFileSync(gradlePath, 'utf8')
gradle = gradle
  .replace(/(namespace\s*=\s*")[^"]*(")/,  `$1${appId}$2`)
  .replace(/(applicationId\s+")[^"]*(")/,  `$1${appId}$2`)
writeFileSync(gradlePath, gradle)
console.log(`✓ build.gradle - applicationId="${appId}"`)

// ── MainActivity.java ───────────────────────────────────────────────────────
const javaRoot = resolve(root, 'android/app/src/main/java')

function findFile(dir, name) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      const found = findFile(full, name)
      if (found) return found
    } else if (entry === name) return full
  }
  return null
}

const existing = findFile(javaRoot, 'MainActivity.java')
const newPkgDir = resolve(javaRoot, appId.replace(/\./g, '/'))
const newFile   = resolve(newPkgDir, 'MainActivity.java')

mkdirSync(newPkgDir, { recursive: true })

if (existing && existing !== newFile) {
  // Moving to new package - update the package declaration, preserve everything else
  const content = readFileSync(existing, 'utf8')
    .replace(/^package\s+[\w.]+;/, `package ${appId};`)
  writeFileSync(newFile, content)
  rmSync(dirname(existing), { recursive: true, force: true })
  console.log(`✓ MainActivity  - moved to ${appId}`)
} else if (!existsSync(newFile)) {
  // First time - write the default
  writeFileSync(newFile, `package ${appId};\n\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {}\n`)
  console.log(`✓ MainActivity  - created at ${appId}`)
} else {
  // Already exists at correct path - only update package name
  const content = readFileSync(newFile, 'utf8')
    .replace(/^package\s+[\w.]+;/, `package ${appId};`)
  writeFileSync(newFile, content)
  console.log(`✓ MainActivity  - package=${appId}`)
}
