#!/usr/bin/env node
import { execSync } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import process from 'process'
import { isDeepStrictEqual } from 'util'

import semver from 'semver'

/**
 * @typedef {object} JSONValidation
 * @property {string | string[]} fileMatch
 * The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch".
 * Exclusion patterns start with '!'
 * @property {string} url
 * A schema URL ('http:', 'https:') or relative path to the extension folder ('./').
 */

const response = await fetch('https://www.schemastore.org/api/json/catalog.json')
if (!response.ok) {
  throw new Error(await response.text())
}

/** @type {import('@schemastore/schema-catalog').JSONSchemaForSchemaStoreOrgCatalogFiles} */
const catalog = await response.json()
const excludePattern = /.\.(cjs|js|mjs|toml|yaml|yml)$/

/** @type {JSONValidation[]} */
const jsonValidation = []

for (const { fileMatch, url } of catalog.schemas) {
  if (!url) {
    continue
  }

  if (!fileMatch) {
    continue
  }

  const filteredMatches = fileMatch.filter(
    (match) => !match.startsWith('!') && !excludePattern.test(match),
  )

  if (!filteredMatches.length) {
    continue
  }

  jsonValidation.push({
    url,
    fileMatch: filteredMatches.length === 1 ? filteredMatches[0] : filteredMatches.sort(),
  })
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
