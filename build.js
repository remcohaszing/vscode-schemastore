#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

import semver from 'semver'

/**
 * @typedef {object} JSONValidation
 * @property {string | string[]} fileMatch
 *   The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch".
 *   Exclusion patterns start with '!'
 * @property {string} url
 *   A schema URL ('http:', 'https:') or relative path to the extension folder ('./').
 */

const response = await fetch('https://www.schemastore.org/api/json/catalog.json')
if (!response.ok) {
  throw new Error(await response.text())
}

/** @type {import('@schemastore/schema-catalog').JSONSchemaForSchemaStoreOrgCatalogFiles} */
const catalog = await response.json()
const excludePattern = /.\.(cff|cjs|js|mjs|toml|yaml|yml)$/

/** @type {JSONValidation[]} */
const jsonValidation = []

const schemasDir = new URL('schemas/', import.meta.url)
await rm(schemasDir, { force: true, recursive: true })
await mkdir(schemasDir)

for (const { fileMatch, name, url, versions } of catalog.schemas) {
  if (!url) {
    continue
  }

  if (!fileMatch) {
    continue
  }

  const filteredMatches = fileMatch.filter((m) => !m.startsWith('!') && !excludePattern.test(m))

  if (!filteredMatches.length) {
    continue
  }

  const match = filteredMatches.length === 1 ? filteredMatches[0] : filteredMatches.sort()

  if (!versions || Object.values(versions).length < 2) {
    jsonValidation.push({ url, fileMatch: match })
    continue
  }

  const normalizedName = name
    .normalize()
    .toLowerCase()
    .replace(/\W+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  const fileName = `${normalizedName}.schema.json`
  await writeFile(
    new URL(fileName, schemasDir),
    `${JSON.stringify(
      { anyOf: Object.values(versions).map(($ref) => ({ $ref })) },
      undefined,
      2,
    )}\n`,
  )

  jsonValidation.push({ url: `./schemas/${fileName}`, fileMatch: match })
}
jsonValidation.sort((a, b) => a.url.localeCompare(b.url))

const path = new URL('package.json', import.meta.url)
const pkg = JSON.parse(await readFile(path, 'utf8'))

if (isDeepStrictEqual(pkg.contributes.jsonValidation, jsonValidation)) {
  console.log('No changes were found in the JSON Schema Store catalog')
} else {
  pkg.version = semver.inc(pkg.version, 'patch')
  pkg.contributes.jsonValidation = jsonValidation
  await writeFile(path, `${JSON.stringify(pkg, undefined, 2)}\n`)
  console.log('Updated package.json')
  if (process.argv.includes('--commit')) {
    execSync(`git commit --all --message v${pkg.version}`)
    execSync(`git tag --no-sign v${pkg.version}`)
    execSync('git push origin HEAD --tags')
    console.log('Committed and pushed changes')
  }
}
