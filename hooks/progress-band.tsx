import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Run, RunStatus, Step, StepStatus } from '../types'

const run = atom({ plugin: 'autofactory', key: 'run' } as const, null, {
  shape: 'run-1',
})

const isForeman = (skill: string) => /(^|:)foreman$/.test(skill)

const STATUSES: StepStatus[] = ['pending', 'in_progress', 'completed']
const isStepStatus = (v: unknown): v is StepStatus =>
  STATUSES.some(s => s === v)

function parseItems(items: unknown): Step[] | null {
  if (!Array.isArray(items)) return null
  const steps: Step[] = []
  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue
    const title = 'content' in item ? item.content : undefined
    const status = 'status' in item ? item.status : undefined
    if (typeof title === 'string' && isStepStatus(status)) steps.push({ title, status })
  }
  return steps
}

// Mirrors update_plan: `items` replaces the list; `advance` completes the
// in-progress step and starts the next pending; `done`/`start` are 1-based.
export function applyPlan(steps: Step[], args: Record<string, unknown>): Step[] {
  const items = parseItems(args.items)
  if (items) return items
  let next = steps
  if (args.advance === true) {
    const at = next.findIndex(s => s.status === 'in_progress')
    next = next.map((s, i) => (i === at ? { ...s, status: 'completed' } : s))
    const pending = next.findIndex((s, i) => i > at && s.status === 'pending')
    next = next.map((s, i) => (i === pending ? { ...s, status: 'in_progress' } : s))
  }
  if (Array.isArray(args.done)) {
    const done = args.done.filter((n): n is number => typeof n === 'number')
    next = next.map((s, i) => (done.includes(i + 1) ? { ...s, status: 'completed' } : s))
  }
  if (typeof args.start === 'number') {
    const start = args.start - 1
    next = next.map((s, i) =>
      i === start ? { ...s, status: 'in_progress' } : s.status === 'in_progress' ? { ...s, status: 'pending' } : s,
    )
  }
  return next
}

const isRunStatus = (v: unknown): v is RunStatus =>
  v === 'running' || v === 'paused' || v === 'done'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'foreman-progress',
      description: 'Show the foreman progress band again after hiding it',
    })
    return next(e)
  })

  on('command.run', { command: 'foreman-progress' }, async $ => {
    const current = await read($, run)
    if (!current) return { text: 'No foreman run in this session yet.' }
    await update($, run, r => r && { ...r, isHidden: false })
    return { text: 'Foreman progress band is back.' }
  })

  on('skill.prompt', async ($, e, next) => {
    const fresh: Run = { status: 'running', skill: null, steps: [], isHidden: false }
    await update($, run, current =>
      isForeman(e.skill) ? fresh : current && { ...current, skill: e.skill },
    )
    return next(e)
  })

  // shortcut: tracks the desktop app's task list (update_plan) only; the
  // terminal's TaskCreate/TaskUpdate aren't followed. Add them if foreman runs there.
  on('tool.call', ($, e, next) => {
    if (e.agentId === undefined && (e.tool === 'mcp__ccd_turn__update_plan' || e.tool === 'mcp__ccd_turn__wrap_up')) {
      const args: Record<string, unknown> = { ...e }
      void update($, run, current => {
        if (!current) return current
        const steps = e.tool === 'mcp__ccd_turn__wrap_up'
          ? current.steps.map(s => ({ ...s, status: 'completed' as const }))
          : applyPlan(current.steps, args)
        return { ...current, steps }
      })
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // The keep-going hook's run.json is foreman's own record of running/paused/done.
  // It also picks up a run that started before this mod loaded, if this session owns it.
  on('turn.complete', async ($, e, next) => {
    try {
      const file: unknown = JSON.parse(await $.fs.read('.claude/foreman/run.json'))
      const status = typeof file === 'object' && file !== null && 'status' in file ? file.status : undefined
      const owner = typeof file === 'object' && file !== null && 'sessionId' in file ? file.sessionId : undefined
      const isOurs = owner === undefined || owner === (await $.session.id())
      if (isRunStatus(status) && isOurs) {
        await update($, run, r =>
          r ? { ...r, status }
            : status === 'done' ? r : { status, skill: null, steps: [], isHidden: false },
        )
      }
    } catch {
      // no run.json here (another cwd, or not written yet): keep what we have
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, run)
    if (e.props.hasSurvey || !current || current.isHidden) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const total = current.steps.length
    const done = current.steps.filter(s => s.status === 'completed').length
    const now = current.steps.find(s => s.status === 'in_progress')
    const width = Math.max(10, Math.min(30, e.props.bodyColumns - 30))
    const filled = total === 0 ? 0 : Math.round((done / total) * width)
    const color = current.status === 'paused' ? 'yellow' : current.status === 'done' ? 'green' : 'cyan'

    return (
      <Box flexDirection="column">
        <Box>
          <Text bold color={color}>Foreman · {current.status}</Text>
          <Text dimColor> · skill: </Text>
          <Text>{current.skill ?? 'none yet'} </Text>
          <Button
            key="hide"
            label="Hide"
            onPress={() => update($, run, r => r && { ...r, isHidden: true })}
          />
        </Box>
        {total > 0 ? (
          <Box>
            <Text color={color}>{'█'.repeat(filled)}</Text>
            <Text dimColor>{'░'.repeat(width - filled)}</Text>
            <Text> {done}/{total}</Text>
            {now && <Text dimColor> · {now.title}</Text>}
          </Box>
        ) : (
          <Text dimColor>Waiting for the playbook's task list…</Text>
        )}
      </Box>
    )
  })
}
