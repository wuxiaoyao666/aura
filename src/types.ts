export type Mode = 'timer' | 'stopwatch'

export interface Task {
  id: number
  title: string
  mode: Mode
  duration: number
  tags: string[]
}
