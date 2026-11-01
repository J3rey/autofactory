import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { findRunFile } from './keep-going.mjs'

// shortcut: one run.json per checkout; two concurrent foreman runs in one checkout — last start wins. Upgrade to per-session files if that bites.
export function claim(input, now) {
  try {
    if (typeof input.prompt === 'string' && input.prompt.trimStart().startsWith('/autofactory:foreman')) {
      const dir = path.join(input.cwd, '.claude', 'foreman')
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
    claim({ session_id: input.session_id, cwd: input.cwd, prompt: input.prompt }, new Date())
  } catch {
    // never block a prompt on hook errors
  }
  process.exit(0)
}
