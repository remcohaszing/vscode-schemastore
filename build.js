#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises'

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

pkg.contributes.jsonValidation = jsonValidation.sort((a, b) => a.url.localeCompare(b.url))
await writeFile(path, `${JSON.stringify(pkg, undefined, 2)}\n`)
