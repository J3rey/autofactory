import { expect, test } from 'claude-code/testing'

import { applyPlan } from './progress-band'

const plan = applyPlan([], {
  items: [
    { content: 'a', status: 'in_progress' },
    { content: 'b', status: 'pending' },
    { content: 'c', status: 'pending' },
  ],
})

test('advance completes current and starts next pending', async () => {
  expect(applyPlan(plan, { advance: true }).map(s => s.status)).toEqual(['completed', 'in_progress', 'pending'])
})

test('done + start are 1-based and move the in-progress marker', async () => {
  expect(applyPlan(plan, { done: [1], start: 3 }).map(s => s.status)).toEqual(['completed', 'pending', 'in_progress'])
})

test('band shows skill and progress after a foreman run starts', async ($, on) => {
  on('skill.prompt', (_, e) => ({ text: e.text }))
  on('tool.call', () => ({ result: {} }))
  await $.skill.prompt({ skill: 'autofactory:foreman', text: '', frontmatter: {}, source: 'plugin' })
  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', items: [
    { content: 'Plan', status: 'completed' },
    { content: 'Build', status: 'in_progress' },
  ] })
  await $.skill.prompt({ skill: 'review-diff', text: '', frontmatter: {}, source: 'projectSettings' })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'autofactory', surface, component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
    })
    expect((await ui.find({ type: 'Text', text: /review-diff/ }))?.text).toContain('review-diff')
    expect((await ui.find({ type: 'Text', text: /1\/2/ }))?.text).toContain('1/2')
    await ui.unmount()
  }
})

test('picks up a run already going from run.json, only if this session owns it', async ($, on) => {
  let owner = 'other'
  on('fs.read', () => ({ value: JSON.stringify({ status: 'running', sessionId: owner }) }))
  on('session.id', () => ({ value: 'me' }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  on('turn.complete', (_, e) => ({ text: e.answer }))
  const TURN = { reason: 'answer', answer: '', durationMs: 1, isAborted: false, turnId: 't' } as const
  const mount = () => $.ui.mount({
    plugin: 'autofactory', surface: 'desktop', component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  })

  await $.turn.complete(TURN)
  let ui = await mount()
  expect(await ui.find({ type: 'Text', text: /Foreman/ })).toBeUndefined()
  await ui.unmount()

  owner = 'me'
  await $.turn.complete(TURN)
  ui = await mount()
  expect((await ui.find({ type: 'Text', text: /Foreman/ }))?.text).toContain('running')
  await ui.unmount()
})
