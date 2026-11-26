import { readFileSync, readdirSync } from 'node:fs'

const packages = new Map()
for (const group of ['apps', 'packages']) {
  for (const dir of readdirSync(group, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    const manifest = JSON.parse(readFileSync(`${group}/${dir.name}/package.json`, 'utf8'))
    const deps = { ...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies, ...manifest.optionalDependencies }
    packages.set(manifest.name, Object.keys(deps).filter(name => name.startsWith('@infinite/')))
  }
}

const checked = new Set()
function visit(name, ancestors) {
  if (ancestors.includes(name)) throw new Error(`Workspace dependency cycle: ${[...ancestors, name].join(' -> ')}`)
  if (checked.has(name)) return
  if (!packages.has(name)) throw new Error(`Unknown workspace package: ${name}`)
  for (const dependency of packages.get(name)) visit(dependency, [...ancestors, name])
  checked.add(name)
}
for (const name of packages.keys()) visit(name, [])
