#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'
import { readFile } from 'fs/promises'

const pkg = JSON.parse(await readFile(new URL('package.json', import.meta.url), 'utf8'))
const diffIndex = spawnSync('git', ['diff-index', '--quiet', 'HEAD'])

if (diffIndex.status === 1) {
  execSync(`git commit --all --message v${pkg.version}`)
  execSync(`git tag --no-sign v${pkg.version}`)
  execSync('git push origin HEAD --tags')
} else if (diffIndex.status !== 0) {
  throw new Error(String(diffIndex.stderr || diffIndex.stdout))
}
