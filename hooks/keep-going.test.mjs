import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { decide } from './keep-going.mjs'

const now = new Date('2026-11-01T12:00:00Z')

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

const running = (over = {}) => ({ status: 'running', startedAt: '2026-11-01T11:00:00Z', blocks: 0, ...over })

test('allows stop when no state file', () => {
  assert.deepEqual(decide({ cwd: project() }, now), { block: false })
})

test('blocks while running', () => {
  const r = decide({ cwd: project(running()) }, now)
  assert.equal(r.block, true)
  assert.match(r.reason, /unfinished|remaining/i)
  assert.match(r.reason, /paused/)
})

test('increments blocks on each block', () => {
  const cwd = project(running())
  decide({ cwd }, now)
  assert.equal(readState(cwd).blocks, 1)
  decide({ cwd }, now)
  assert.equal(readState(cwd).blocks, 2)
})

test('allows stop when paused', () => {
  assert.deepEqual(decide({ cwd: project(running({ status: 'paused' })) }, now), { block: false })
})

test('allows stop when done', () => {
  assert.deepEqual(decide({ cwd: project(running({ status: 'done' })) }, now), { block: false })
})

test('allows stop on malformed json', () => {
  assert.deepEqual(decide({ cwd: project('{not json') }, now), { block: false })
})

test('allows stop after 25 consecutive blocks', () => {
  const cwd = project(running({ blocks: 25 }))
  assert.deepEqual(decide({ cwd }, now), { block: false })
  assert.equal(readState(cwd).blocks, 25)
})

test('allows stop when state file older than 6h', () => {
  const cwd = project(running({ startedAt: '2026-11-01T05:59:00Z' }))
  assert.deepEqual(decide({ cwd }, now), { block: false })
})
