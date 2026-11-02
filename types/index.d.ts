export type StepStatus = 'pending' | 'in_progress' | 'completed'
export type Step = { title: string; status: StepStatus }
export type RunStatus = 'running' | 'paused' | 'done'
export type Run = { status: RunStatus; skill: string | null; steps: Step[]; isHidden: boolean }

declare module 'claude-code' {
  interface PluginState {
    'autofactory': { run: Shaped<Run | null> }
  }
}
