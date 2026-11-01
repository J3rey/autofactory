import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_BLOCKS = 25
const STALE_MS = 6 * 60 * 60 * 1000
const ALLOW = { block: false }
const REASON =
  'Foreman run is still running: finish the remaining task-list steps, or if you are waiting on the owner set .claude/foreman/run.json status to "paused" (or "done" when finished) before stopping.'

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

export function decide(input, now) {
  try {
    const file = findRunFile(input.cwd)
    if (!file) return ALLOW
    const state = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (state.sessionId !== input.session_id || state.status !== 'running') return ALLOW
    const updated = Date.parse(state.updatedAt)
    if (!Number.isFinite(updated) || now.getTime() - updated > STALE_MS) return ALLOW
    const blocks = Number.isInteger(state.blocks) ? state.blocks : 0
    if (blocks >= MAX_BLOCKS) return ALLOW
    fs.writeFileSync(file, JSON.stringify({ ...state, blocks: blocks + 1 }, null, 2))
    return { block: true, reason: REASON }
  } catch {
    return ALLOW
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const raw = fs.readFileSync(0, 'utf8')
    const input = JSON.parse(raw)
    const result = decide({ session_id: input.session_id, cwd: input.cwd }, new Date())
    if (result.block) process.stdout.write(JSON.stringify({ decision: 'block', reason: result.reason }))
  } catch {
    // never block on hook errors
  }
  process.exit(0)
}
