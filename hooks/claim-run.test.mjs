import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { claim } from './claim-run.mjs'

const now = new Date('2026-11-01T12:00:00Z')

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'claim-run-'))
const runFile = (cwd) => path.join(cwd, '.claude', 'foreman', 'run.json')
const readState = (cwd) => JSON.parse(fs.readFileSync(runFile(cwd), 'utf8'))

function seed(cwd, state) {
  fs.mkdirSync(path.dirname(runFile(cwd)), { recursive: true })
  fs.writeFileSync(runFile(cwd), JSON.stringify(state))
}

test('ignores a prompt that only mentions foreman', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'claim-'))
  claim({ session_id: 's1', cwd, prompt: 'what does /autofactory:foreman do?' }, new Date())
  assert.equal(fs.existsSync(path.join(cwd, '.claude', 'foreman', 'run.json')), false)
})

test('creates running file on foreman prompt', () => {
  const cwd = tmp()
  claim({ session_id: 's1', cwd, prompt: '/autofactory:foreman fix the login bug' }, now)
  assert.deepEqual(readState(cwd), {
    status: 'running',
    sessionId: 's1',
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    blocks: 0,
  })
})

test('refreshes updatedAt and resets blocks for owning session', () => {
  const cwd = tmp()
  seed(cwd, {
    status: 'paused',
    sessionId: 's1',
    startedAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
    blocks: 7,
  })
  claim({ session_id: 's1', cwd, prompt: 'yes, go ahead' }, now)
  const s = readState(cwd)
  assert.equal(s.updatedAt, now.toISOString())
  assert.equal(s.blocks, 0)
  assert.equal(s.status, 'paused')
  assert.equal(s.startedAt, '2026-11-01T08:00:00Z')
})

test('ignores other sessions', () => {
  const cwd = tmp()
  const before = { status: 'running', sessionId: 's1', startedAt: 'a', updatedAt: 'b', blocks: 7 }
  seed(cwd, before)
  claim({ session_id: 's2', cwd, prompt: 'something else' }, now)
  assert.deepEqual(readState(cwd), before)
})

const foreman = '/autofactory:foreman fix the login bug'
const clashFor = (status, startedAt) =>
  `Foreman clash: another foreman run is already active in this folder (status ${status}, started ${startedAt}). Tell the owner before doing anything, and recommend running this job in a separate worktree.`

test('flags a fresh running file owned by another session and leaves it alone', () => {
  const cwd = tmp()
  const before = { status: 'running', sessionId: 's1', startedAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T11:00:00Z', blocks: 2 }
  seed(cwd, before)
  const note = claim({ session_id: 's2', cwd, prompt: foreman }, now)
  assert.equal(note, clashFor('running', before.startedAt))
  assert.deepEqual(readState(cwd), before)
})

test('flags a fresh paused file owned by another session', () => {
  const cwd = tmp()
  const before = { status: 'paused', sessionId: 's1', startedAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T11:00:00Z', blocks: 0 }
  seed(cwd, before)
  assert.equal(claim({ session_id: 's2', cwd, prompt: foreman }, now), clashFor('paused', before.startedAt))
  assert.deepEqual(readState(cwd), before)
})

test('flags a fresh unowned running file', () => {
  const cwd = tmp()
  const before = { status: 'running', startedAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T11:00:00Z', blocks: 0 }
  seed(cwd, before)
  assert.equal(claim({ session_id: 's2', cwd, prompt: foreman }, now), clashFor('running', before.startedAt))
  assert.deepEqual(readState(cwd), before)
})

test('same session restarting foreman refreshes without a clash', () => {
  const cwd = tmp()
  seed(cwd, { status: 'running', sessionId: 's1', startedAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T11:00:00Z', blocks: 4 })
  assert.equal(claim({ session_id: 's1', cwd, prompt: foreman }, now), undefined)
  assert.deepEqual(readState(cwd), {
    status: 'running',
    sessionId: 's1',
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    blocks: 0,
  })
})

test('overwrites a stale other-session file', () => {
  const cwd = tmp()
  seed(cwd, { status: 'running', sessionId: 's1', startedAt: '2026-10-31T01:00:00Z', updatedAt: '2026-10-31T02:00:00Z', blocks: 4 })
  assert.equal(claim({ session_id: 's2', cwd, prompt: foreman }, now), undefined)
  assert.equal(readState(cwd).sessionId, 's2')
})

test('overwrites a done other-session file', () => {
  const cwd = tmp()
  seed(cwd, { status: 'done', sessionId: 's1', startedAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T11:00:00Z', blocks: 0 })
  assert.equal(claim({ session_id: 's2', cwd, prompt: foreman }, now), undefined)
  assert.equal(readState(cwd).sessionId, 's2')
  assert.equal(readState(cwd).status, 'running')
})

test('never throws on a corrupt run file', () => {
  const cwd = tmp()
  fs.mkdirSync(path.dirname(runFile(cwd)), { recursive: true })
  fs.writeFileSync(runFile(cwd), '{not json')
  assert.doesNotThrow(() => claim({ session_id: 's2', cwd, prompt: foreman }, now))
})

test('never throws on unreadable dir', () => {
  assert.doesNotThrow(() =>
    claim({ session_id: 's1', cwd: '/definitely/not/a/real/dir/\0x', prompt: '/autofactory:foreman go' }, now),
  )
  assert.doesNotThrow(() => claim({}, now))
})
