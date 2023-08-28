#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
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

/** @type {Map<string, Set<string>>} */
const schemasByMatch = new Map()

// Collect a map where each match is mapped to a corresponding URL.
// Some matches may match multiple schemas.
for (const { fileMatch, url, versions } of catalog.schemas) {
  if (!fileMatch) {
    continue
  }

  for (let match of fileMatch) {
    if (excludePattern.test(match)) {
      continue
    }

    // For VS Code schema matching, `**/rest/of/glob` is equivalent to `rest/of/glob`.
    match = match.replace(/^\*\*?\//, '')
    const set = schemasByMatch.get(match) || new Set()
    schemasByMatch.set(match, set)
    if (url) {
      set.add(url)
    }
    if (versions) {
      for (const versionUrl of Object.values(versions)) {
        set.add(versionUrl)
      }
    }
  }
}

/** @type {Map<Set<string>, Set<string>>} */
const schemasByUrls = new Map()

// Group all URLs together that share the same match.
collectSchemas: for (const [match, urls] of schemasByMatch) {
  for (const [possibleDuplicate, allMatches] of schemasByUrls) {
    if (isDeepStrictEqual(urls, possibleDuplicate)) {
      allMatches.add(match)
      continue collectSchemas
    }
  }
  schemasByUrls.set(urls, new Set([match]))
}

// Generate the actual JSON schema validation array used by the extension.
for (const [urls, matches] of schemasByUrls) {
  let [url] = urls
  // If there is only one matching URL, point there directly.
  // Otherwise, generate a schema that references all matching schemas using `anyOf` and `$ref`.
  if (urls.size > 1) {
    const [match] = matches
    const name = match
      .replaceAll(/\b(json|schema)\b/g, '')
      .replaceAll('*', '')
      .replaceAll(/\W+/g, '-')
      .replaceAll(/(^-|-$)/g, '')
    url = `./schemas/${name}.schema.json`
    await writeFile(
      url,
      `${JSON.stringify({ anyOf: [...urls].sort().map((ref) => ({ $ref: ref })) }, undefined, 2)}\n`
    )
  }

  /** @type {string[]} */
  const fileMatch = []

  for (const match of matches) {
    const base = basename(match)
    // If the match is the same as the base name, it’s always ok.
    if (base === match) {
      fileMatch.push(match)
    }

    // VS Code will detect it already if the base name is matched.
    // There’s no need to include a specific glob additionally.
    if (!matches.has(base)) {
      fileMatch.push(match)
    }
  }

  jsonValidation.push({
    url,
    fileMatch: fileMatch.length === 1 ? fileMatch[0] : fileMatch.sort()
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
    execSync('git add .')
    execSync(`git commit --message v${pkg.version}`)
    execSync(`git tag --no-sign v${pkg.version}`)
    execSync('git push origin HEAD --tags')
    console.log('Committed and pushed changes')
  }
}
