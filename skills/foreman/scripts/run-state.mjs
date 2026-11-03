import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const STATUSES = ['running', 'paused', 'done']
const STALE_MS = 6 * 60 * 60 * 1000
const USAGE = 'usage: run-state.mjs <running|paused|done> [cwd]'

// duplicated from hooks/keep-going.mjs so the skill script does not depend on the hooks dir layout
export function findRunFile(cwd) {
  let dir = path.resolve(cwd)
  for (;;) {
    const file = path.join(dir, '.claude', 'foreman', 'run.json')
    if (fs.existsSync(file)) return file
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function nextState(status, existing, now) {
  const iso = now.toISOString()
  const updated = existing ? Date.parse(existing.updatedAt) : NaN
  const stale = !Number.isFinite(updated) || now.getTime() - updated > STALE_MS
  if (status === 'running' && (!existing || existing.status === 'done' || stale)) {
    return { status: 'running', startedAt: iso, updatedAt: iso, blocks: 0 }
  }
  if (!existing) return { status, startedAt: iso, updatedAt: iso, blocks: 0 }
  return { ...existing, status, updatedAt: iso }
}

export function setRunState(status, cwd, now = new Date()) {
  if (!STATUSES.includes(status)) throw new Error(USAGE)
  const found = findRunFile(cwd)
  const file = found ?? path.join(path.resolve(cwd), '.claude', 'foreman', 'run.json')
  const existing = found ? JSON.parse(fs.readFileSync(found, 'utf8')) : null
  const state = nextState(status, existing, now)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2))
  fs.renameSync(tmp, file)
  return state
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [status, cwd = process.cwd()] = process.argv.slice(2)
  if (!STATUSES.includes(status)) {
    process.stderr.write(`${USAGE}\n`)
    process.exit(2)
  }
  try {
    process.stdout.write(`${JSON.stringify(setRunState(status, cwd), null, 2)}\n`)
  } catch (err) {
    process.stderr.write(`run-state: ${err.message}\n`)
    process.exit(1)
  }
}
