#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process'

const diffIndex = spawnSync('git', ['diff-index', '--quiet', 'HEAD'])

switch (diffIndex.status) {
  case 0:
    break
  case 1:
    execSync('npm version patch')
    execSync('git push origin HEAD --tags')
    break
  default:
    throw new Error(String(diffIndex.stderr || diffIndex.stdout))
}
