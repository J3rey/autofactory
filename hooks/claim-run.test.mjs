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

test('never throws on unreadable dir', () => {
  assert.doesNotThrow(() =>
    claim({ session_id: 's1', cwd: '/definitely/not/a/real/dir/\0x', prompt: '/autofactory:foreman go' }, now),
  )
  assert.doesNotThrow(() => claim({}, now))
})
