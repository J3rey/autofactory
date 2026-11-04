import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { setRunState } from './run-state.mjs'

const script = fileURLToPath(new URL('./run-state.mjs', import.meta.url))
const now = new Date('2026-11-01T12:00:00Z')

function project(state) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'run-state-'))
  if (state !== undefined) {
    fs.mkdirSync(path.join(cwd, '.claude', 'foreman'), { recursive: true })
    fs.writeFileSync(path.join(cwd, '.claude', 'foreman', 'run.json'), JSON.stringify(state))
  }
  return cwd
}

const readState = (cwd) =>
  JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'foreman', 'run.json'), 'utf8'))

const live = (over = {}) => ({
  status: 'paused',
  sessionId: 'sid',
  startedAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T11:30:00Z',
  blocks: 3,
  ...over,
})

test('creates a fresh running file with no sessionId when the session is unknown', () => {
  const cwd = project()
  const state = setRunState('running', cwd, now, '')
  assert.deepEqual(state, { status: 'running', startedAt: now.toISOString(), updatedAt: now.toISOString(), blocks: 0 })
  assert.deepEqual(readState(cwd), state)
})

test('status flip keeps sessionId, startedAt and blocks', () => {
  const cwd = project(live())
  setRunState('running', cwd, now, 'other')
  assert.deepEqual(readState(cwd), live({ status: 'running', updatedAt: now.toISOString() }))
})

test('stale running restarts fresh', () => {
  const cwd = project(live({ status: 'running', updatedAt: '2026-11-01T01:00:00Z' }))
  const state = setRunState('running', cwd, now, 'me')
  assert.equal(state.sessionId, 'me')
  assert.equal(state.blocks, 0)
  assert.equal(state.startedAt, now.toISOString())
})

test('done restarts fresh on running', () => {
  const cwd = project(live({ status: 'done' }))
  const state = setRunState('running', cwd, now, 'me')
  assert.equal(state.sessionId, 'me')
  assert.equal(state.startedAt, now.toISOString())
})

test('fresh running records the calling session as owner', () => {
  const cwd = project()
  assert.equal(setRunState('running', cwd, now, 'me').sessionId, 'me')
  assert.equal(readState(cwd).sessionId, 'me')
})

test('flip on an ownerless run records the calling session', () => {
  const cwd = project(live({ sessionId: undefined }))
  assert.equal(setRunState('running', cwd, now, 'me').sessionId, 'me')
})

test('paused and done create the file when missing', () => {
  for (const status of ['paused', 'done']) {
    const cwd = project()
    assert.equal(setRunState(status, cwd, now).status, status)
    assert.equal(readState(cwd).status, status)
  }
})

test('walks up from a nested dir and updates the found file', () => {
  const cwd = project(live())
  const nested = path.join(cwd, 'a', 'b')
  fs.mkdirSync(nested, { recursive: true })
  setRunState('done', nested, now)
  assert.equal(readState(cwd).status, 'done')
  assert.equal(fs.existsSync(path.join(nested, '.claude')), false)
})

test('bad status exits non-zero with usage', () => {
  const r = spawnSync('node', [script, 'bogus', project()], { encoding: 'utf8' })
  assert.notEqual(r.status, 0)
  assert.match(r.stderr, /usage/)
})

test('unparseable file exits non-zero', () => {
  const cwd = project()
  fs.mkdirSync(path.join(cwd, '.claude', 'foreman'), { recursive: true })
  fs.writeFileSync(path.join(cwd, '.claude', 'foreman', 'run.json'), '{nope')
  const r = spawnSync('node', [script, 'running', cwd], { encoding: 'utf8' })
  assert.notEqual(r.status, 0)
})

test('CLI prints the resulting JSON', () => {
  const cwd = project()
  const r = spawnSync('node', [script, 'running', cwd], {
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_CODE_SESSION_ID: 'cli-session' },
  })
  assert.equal(r.status, 0)
  assert.equal(JSON.parse(r.stdout).status, 'running')
  assert.equal(JSON.parse(r.stdout).sessionId, 'cli-session')
})
