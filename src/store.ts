import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Task, Mode } from './types'

// --- 状态定义 ---
export const isMini = ref(false)
export const mode = ref<Mode>('timer')
export const isRunning = ref(false)

// 时间状态
export const timeLeft = ref(25 * 60)
export const timeElapsed = ref(0)
export const timerDuration = ref(25 * 60) // 倒计时总时长

// 任务数据
export const tasks = ref<Task[]>([])
export const currentTask = ref<Task | null>(null)

let timerInterval: number | null = null

// --- 计算属性 ---
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export const displayTime = computed(() => {
  return mode.value === 'timer' ? formatTime(timeLeft.value) : formatTime(timeElapsed.value)
})

export const progressPercentage = computed(() => {
  if (mode.value === 'timer') {
    return (timeLeft.value / timerDuration.value) * 100
  } else {
    const target = currentTask.value?.duration ? currentTask.value.duration * 60 : 60 * 60
    return Math.min((timeElapsed.value / target) * 100, 100)
  }
})

export const themeColor = computed(() => {
  return mode.value === 'timer' ? 'text-emerald-400' : 'text-sky-400'
})

export const progressColor = computed(() => {
  return mode.value === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'
})

// --- 动作 Actions ---

export const toggleTimer = () => {
  if (isRunning.value) pauseTimer()
  else startTimer()
}

export const startTimer = () => {
  if (isRunning.value) return
  isRunning.value = true

  const now = Date.now()
  let endTime = 0
  let startTime = 0

  if (mode.value === 'timer') {
    endTime = now + timeLeft.value * 1000
  } else {
    startTime = now - timeElapsed.value * 1000
  }

  timerInterval = setInterval(() => {
    const currentNow = Date.now()

    if (mode.value === 'timer') {
      const remainingMs = endTime - currentNow
      const remainingSec = Math.ceil(remainingMs / 1000)
      if (remainingSec <= 0) {
        timeLeft.value = 0
        pauseTimer()
        // 任务完成，自动恢复大窗口
        if (isMini.value) toggleMiniMode()
        // TODO: 这里是未来接入后端 "完成任务" API 的地方
      } else {
        timeLeft.value = remainingSec
      }
    } else {
      const elapsedMs = currentNow - startTime
      timeElapsed.value = Math.floor(elapsedMs / 1000)
    }
  }, 200)
}

export const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

export const resetTimer = () => {
  pauseTimer()
  if (currentTask.value) {
    if (currentTask.value.mode === 'timer') {
      timeLeft.value = currentTask.value.duration * 60
    } else {
      timeElapsed.value = 0
    }
  } else {
    timeLeft.value = 25 * 60
    timeElapsed.value = 0
  }
}

export const switchMode = (newMode: Mode) => {
  mode.value = newMode
  resetTimer()
}

export const toggleMode = () => {
  switchMode(mode.value === 'timer' ? 'stopwatch' : 'timer')
}

export const toggleMiniMode = async () => {
  isMini.value = !isMini.value
  await invoke('toggle_mini_mode', { isMini: isMini.value })
}

// --- 任务管理 Actions ---

export const addTask = (task: Task) => {
  tasks.value.push(task)
  // TODO: 这里是未来接入后端 "createTask" API 的地方
}

export const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter((t) => t.id !== id)
  if (currentTask.value?.id === id) {
    clearCurrentTask()
  }
  // TODO: 这里接入 "deleteTask" API
}

export const loadTask = (task: Task) => {
  currentTask.value = task
  mode.value = task.mode

  pauseTimer()
  if (task.mode === 'timer') {
    timerDuration.value = task.duration * 60
    timeLeft.value = timerDuration.value
  } else {
    timeElapsed.value = 0
  }

  startTimer()

  if (!isMini.value) {
    toggleMiniMode()
  }
}

export const clearCurrentTask = () => {
  currentTask.value = null
  resetTimer()
}
