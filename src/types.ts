export type Mode = 'timer' | 'stopwatch' | 'break'

export interface Task {
  id: number
  title: string
  mode: Mode
  duration: number // 专注设定时长(分钟) 或 正计时预期时长
  tags: string[]
  act: number // 实际完成的番茄数 (预留字段)
  est: number // 预估番茄数 (预留字段)
  breakDuration: number // 预设休息时长
  isCompleted?: boolean
  createdAt?: string
}
