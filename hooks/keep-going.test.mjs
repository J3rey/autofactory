import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { decide } from './keep-going.mjs'

const now = new Date('2026-11-01T12:00:00Z')
const SID = 'session-a'

function project(state) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'keep-going-'))
  if (state !== undefined) {
    fs.mkdirSync(path.join(cwd, '.claude', 'foreman'), { recursive: true })
    fs.writeFileSync(
      path.join(cwd, '.claude', 'foreman', 'run.json'),
      typeof state === 'string' ? state : JSON.stringify(state),
    )
  }
  return cwd
}

const readState = (cwd) =>
  JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'foreman', 'run.json'), 'utf8'))

const running = (over = {}) => ({
  status: 'running',
  sessionId: SID,
  startedAt: '2026-11-01T11:00:00Z',
  updatedAt: '2026-11-01T11:30:00Z',
  blocks: 0,
  ...over,
})

const input = (cwd, over = {}) => ({ session_id: SID, cwd, ...over })

test('allows stop when no state file', () => {
  assert.deepEqual(decide(input(project()), now), { block: false })
})

test('blocks while running', () => {
  const r = decide(input(project(running())), now)
  assert.equal(r.block, true)
  assert.match(r.reason, /unfinished|remaining/i)
  assert.match(r.reason, /paused/)
})

test('increments blocks on each block', () => {
  const cwd = project(running())
  decide(input(cwd), now)
  assert.equal(readState(cwd).blocks, 1)
  decide(input(cwd), now)
  assert.equal(readState(cwd).blocks, 2)
})

test('allows stop when paused', () => {
  assert.deepEqual(decide(input(project(running({ status: 'paused' }))), now), { block: false })
})

test('allows stop when done', () => {
  assert.deepEqual(decide(input(project(running({ status: 'done' }))), now), { block: false })
})

test('allows stop on malformed json', () => {
  assert.deepEqual(decide(input(project('{not json')), now), { block: false })
})

test('allows stop after 25 blocks', () => {
  const cwd = project(running({ blocks: 25 }))
  assert.deepEqual(decide(input(cwd), now), { block: false })
  assert.equal(readState(cwd).blocks, 25)
})

test('allows stop when state file older than 6h', () => {
  const cwd = project(running({ updatedAt: '2026-11-01T05:59:00Z' }))
  assert.deepEqual(decide(input(cwd), now), { block: false })
})

test('allows stop for a different session', () => {
  const cwd = project(running())
  assert.deepEqual(decide(input(cwd, { session_id: 'session-b' }), now), { block: false })
  assert.equal(readState(cwd).blocks, 0)
})

test('finds run.json from a nested worktree dir', () => {
  const root = project(running())
  const nested = path.join(root, '.claude', 'worktrees', 'x', 'src')
  fs.mkdirSync(nested, { recursive: true })
  assert.equal(decide(input(nested), now).block, true)
  assert.equal(readState(root).blocks, 1)
})

test('stale uses updatedAt not startedAt', () => {
  const old = running({ startedAt: '2026-10-31T00:00:00Z', updatedAt: '2026-11-01T11:30:00Z' })
  assert.equal(decide(input(project(old)), now).block, true)
})
