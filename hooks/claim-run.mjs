import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { findRunFile } from './keep-going.mjs'

const STALE_MS = 6 * 60 * 60 * 1000

function clashNote(file, sessionId, now) {
  if (!fs.existsSync(file)) return null
  const state = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (state.status !== 'running' && state.status !== 'paused') return null
  const updated = Date.parse(state.updatedAt)
  if (!Number.isFinite(updated) || now.getTime() - updated > STALE_MS) return null
  if (typeof state.sessionId === 'string' && state.sessionId === sessionId) return null
  return `Foreman clash: another foreman run is already active in this folder (status ${state.status}, started ${state.startedAt}). Tell the owner before doing anything, and recommend running this job in a separate worktree.`
}

// shortcut: one run.json per checkout; a second foreman run in the same checkout is flagged, not run side by side. Upgrade to per-session files if owners want both at once.
// Returns a context note for the model on a clash, otherwise nothing.
export function claim(input, now) {
  try {
    if (typeof input.prompt === 'string' && input.prompt.trimStart().startsWith('/autofactory:foreman')) {
      const dir = path.join(input.cwd, '.claude', 'foreman')
      const note = clashNote(path.join(dir, 'run.json'), input.session_id, now)
      if (note) return note
      fs.mkdirSync(dir, { recursive: true })
      const stamp = now.toISOString()
      const state = { status: 'running', sessionId: input.session_id, startedAt: stamp, updatedAt: stamp, blocks: 0 }
      fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify(state, null, 2))
      return
    }
    const file = findRunFile(input.cwd)
    if (!file) return
    const state = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (state.sessionId !== input.session_id) return
    fs.writeFileSync(file, JSON.stringify({ ...state, updatedAt: now.toISOString(), blocks: 0 }, null, 2))
  } catch {
    // never block a prompt on hook errors
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'))
    const note = claim({ session_id: input.session_id, cwd: input.cwd, prompt: input.prompt }, new Date())
    if (note) process.stdout.write(note)
  } catch {
    // never block a prompt on hook errors
  }
  process.exit(0)
}
