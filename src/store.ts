import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Task, Mode } from './types'

// --- 视图状态 ---
export type ViewState = 'dashboard' | 'focus'
export const currentView = ref<ViewState>('dashboard')
export const isMini = ref(false)

// --- 计时器状态 ---
export const mode = ref<Mode>('timer')
export const isRunning = ref(false)
export const timeLeft = ref(25 * 60)
export const timeElapsed = ref(0)
export const timerDuration = ref(25 * 60) // 倒计时总时长

// --- 任务数据 ---
export const tasks = ref<Task[]>([])
export const currentTask = ref<Task | null>(null)
// 简单的正计时预估时间(秒)，默认30分钟
export const estimatedTime = ref(30 * 60)

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
    // 正计时进度
    const target = currentTask.value?.duration
      ? currentTask.value.duration * 60
      : estimatedTime.value
    return Math.min((timeElapsed.value / target) * 100, 100)
  }
})

export const themeColor = computed(() => {
  return mode.value === 'timer' ? 'text-emerald-400' : 'text-sky-400'
})

export const progressColor = computed(() => {
  return mode.value === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'
})

// --- 核心动作 Actions ---

export const toggleMiniMode = async () => {
  isMini.value = !isMini.value
  await invoke('toggle_mini_mode', { isMini: isMini.value })
}

export const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
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
        // 倒计时结束：自动恢复大窗口提醒用户
        if (isMini.value) {
          toggleMiniMode()
        }
        // TODO: 任务完成逻辑
      } else {
        timeLeft.value = remainingSec
      }
    } else {
      const elapsedMs = currentNow - startTime
      timeElapsed.value = Math.floor(elapsedMs / 1000)
    }
  }, 200)
}

export const toggleTimer = () => {
  if (isRunning.value) pauseTimer()
  else startTimer()
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
    // 默认值
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

// --- 业务流程 Actions ---

export const addTask = (task: Task) => {
  tasks.value.push(task)
}

export const clearCurrentTask = () => {
  currentTask.value = null
  resetTimer()
}

export const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter((t) => t.id !== id)
  if (currentTask.value?.id === id) {
    clearCurrentTask()
  }
}

// 开始专注（入口函数）
export const startFocus = (task?: Task) => {
  if (task) {
    // 1. 有任务：加载配置
    currentTask.value = task
    mode.value = task.mode

    pauseTimer()
    if (task.mode === 'timer') {
      timerDuration.value = task.duration * 60
      timeLeft.value = timerDuration.value
    } else {
      timeElapsed.value = 0
    }

    // 2. 有任务时：自动变 Mini + 自动开始
    if (!isMini.value) {
      toggleMiniMode()
    }
    startTimer()
  } else {
    // 1. 自由专注：重置为默认
    currentTask.value = null
    mode.value = 'timer'
    resetTimer()

    // 2. 自由专注：不自动变 Mini，也不自动开始，先让用户看大屏
    pauseTimer()
  }

  // 切换到专注视图
  currentView.value = 'focus'
}

export const backToDashboard = () => {
  pauseTimer()
  currentView.value = 'dashboard'
  // 如果当前是 mini 模式，切回列表时也应该恢复大窗口（看需求，这里先不强制）
  if (isMini.value) {
    toggleMiniMode()
  }
}
