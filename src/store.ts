// src/store.ts
import { computed, ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
// 系统通知
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import type { Mode, Task } from './types'

// --- 视图状态 ---
export type ViewState = 'dashboard' | 'focus'
export const currentView = ref<ViewState>('dashboard')
export const isMini = ref(false)

// --- 计时器状态 ---
export const mode = ref<Mode>('timer')
export const isRunning = ref(false)
export const timeLeft = ref(25 * 60)
export const timeElapsed = ref(0)
export const timerDuration = ref(25 * 60)

// 超时模式状态
export const isOvertime = ref(false)
export const overtimeSeconds = ref(0)

// --- 任务数据 ---
export const tasks = ref<Task[]>([])
export const currentTask = ref<Task | null>(null)
export const estimatedTime = ref(30 * 60)

let timerInterval: number | null = null

// 初始化数据
export const loadTasks = async () => {
  try {
    tasks.value = await invoke<Task[]>('get_tasks', { excludeCompleted: true })
  } catch (e) {
    console.error('加载任务失败:', e)
  }
}

// 发送系统通知
const sendNotify = async (title: string, body: string) => {
  let permissionGranted = await isPermissionGranted()
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }
  if (permissionGranted) {
    sendNotification({ title, body })
  }
}

// --- 计算属性 ---
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export const displayTime = computed(() => {
  // 超时模式下，显示 "+ MM:SS"
  if (isOvertime.value) {
    return `+ ${formatTime(overtimeSeconds.value)}`
  }
  return mode.value === 'timer' || mode.value === 'break'
    ? formatTime(timeLeft.value)
    : formatTime(timeElapsed.value)
})

export const progressPercentage = computed(() => {
  if (isOvertime.value) return 100 // 超时进度条全满

  if (mode.value === 'timer' || mode.value === 'break') {
    if (timerDuration.value === 0) return 0
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
  // 优先级：超时(红) > 休息(蓝紫) > 专注(绿/蓝)
  if (isOvertime.value) return 'text-rose-500'
  if (mode.value === 'break') return 'text-indigo-400'
  return mode.value === 'timer' ? 'text-emerald-400' : 'text-sky-400'
})

export const progressColor = computed(() => {
  if (isOvertime.value) return 'bg-rose-500'
  if (mode.value === 'break') return 'bg-indigo-500'
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

  if (mode.value === 'timer' || mode.value === 'break') {
    if (isOvertime.value) {
      startTime = now - overtimeSeconds.value * 1000
    } else {
      endTime = now + timeLeft.value * 1000
    }
  } else {
    startTime = now - timeElapsed.value * 1000
  }

  timerInterval = setInterval(() => {
    const currentNow = Date.now()

    if (mode.value === 'timer' || mode.value === 'break') {
      if (!isOvertime.value) {
        // 正常倒计时
        const remainingMs = endTime - currentNow
        const remainingSec = Math.ceil(remainingMs / 1000)

        if (remainingSec <= 0) {
          timeLeft.value = 0

          if (mode.value === 'break') {
            // 休息结束

            // 发送系统通知
            sendNotify('休息结束', '电量已充满，准备开始工作吧！')

            // 停止计时
            pauseTimer()

            // 2. 切回之前的模式
            if (currentTask.value) {
              mode.value = currentTask.value.mode
              if (currentTask.value.mode === 'timer') {
                timeLeft.value = currentTask.value.duration * 60
                timerDuration.value = currentTask.value.duration * 60
              } else {
                timeElapsed.value = 0
              }
            } else {
              mode.value = 'timer'
              timeLeft.value = 25 * 60
              timerDuration.value = 25 * 60
            }
          } else {
            // 发送通知
            sendNotify('专注完成', '棒极了！要不要休息一下？')

            // 专注结束：自动进入超时模式
            isOvertime.value = true
            startTime = currentNow
            overtimeSeconds.value = 0
          }
        } else {
          timeLeft.value = remainingSec
        }
      } else {
        // 超时正计时逻辑
        const overMs = currentNow - startTime
        overtimeSeconds.value = Math.floor(overMs / 1000)
      }
    } else {
      // Stopwatch 模式
      const elapsedMs = currentNow - startTime
      timeElapsed.value = Math.floor(elapsedMs / 1000)
    }
  }, 200)
}

export const toggleTimer = () => {
  if (isRunning.value) pauseTimer()
  else startTimer()
}

// 结束休息，直接开始工作
export const endBreak = () => {
  // 1. 强制切换回之前的模式 (Timer 或 Stopwatch)
  if (currentTask.value) {
    mode.value = currentTask.value.mode
  } else {
    mode.value = 'timer' // 默认为番茄钟
  }

  // 2. 重置时间 (读取任务原本的时长)
  resetTimer()

  // 3. 自动开始运行
  startTimer()

  // 4. 确保切回大窗口的 Focus 视图 (如果在大窗口模式下)
  currentView.value = 'focus'
}

// 开始休息
export const startBreak = (minutes: number = 5) => {
  pauseTimer()
  isOvertime.value = false
  overtimeSeconds.value = 0

  mode.value = 'break'
  timerDuration.value = minutes * 60
  timeLeft.value = timerDuration.value

  startTimer()
}

export const resetTimer = () => {
  pauseTimer()
  isOvertime.value = false
  overtimeSeconds.value = 0

  if (mode.value === 'break') {
    timeLeft.value = 5 * 60
    timerDuration.value = 5 * 60
  } else if (currentTask.value) {
    if (currentTask.value.mode === 'timer') {
      timeLeft.value = currentTask.value.duration * 60
      timerDuration.value = currentTask.value.duration * 60
    } else {
      timeElapsed.value = 0
    }
  } else {
    timeLeft.value = 25 * 60
    timeElapsed.value = 0
    timerDuration.value = 25 * 60
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

export const completeTask = async () => {
  if (!currentTask.value) return

  const doneId = currentTask.value.id
  try {
    await invoke('complete_task_in_db', { id: doneId })

    const taskIndex = tasks.value.findIndex((t) => t.id === doneId)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].isCompleted = true
    }

    isOvertime.value = false
    overtimeSeconds.value = 0

    const nextTask = tasks.value.find((t) => !t.isCompleted)
    if (nextTask) {
      startFocus(nextTask)
    } else {
      // 回归默认专注状态
      mode.value = 'timer'

      clearCurrentTask()
      if (isMini.value) {
        toggleMiniMode()
      }
      currentView.value = 'dashboard'
    }
  } catch (e) {
    console.error('完成任务失败', e)
  }
}

export const activeTasks = computed(() => {
  return tasks.value.filter((t) => !t.isCompleted)
})

export const completedTasks = computed(() => {
  return tasks.value.filter((t) => t.isCompleted)
})

export const addTask = async (task: Task) => {
  try {
    // 调用 Rust 保存到数据库
    const newId = await invoke<number>('create_task', {
      title: task.title,
      duration: task.duration,
      mode: task.mode,
      breakDuration: task.breakDuration,
      tags: task.tags,
      est: task.est,
    })

    // 更新前端状态
    tasks.value.unshift({ ...task, id: newId })
  } catch (e) {
    console.error('保存任务失败:', e)
  }
}

// 更新任务
export const updateTask = async (updatedTask: Task) => {
  try {
    await invoke('update_task_in_db', {
      id: updatedTask.id,
      title: updatedTask.title,
      duration: updatedTask.duration,
      mode: updatedTask.mode,
      breakDuration: updatedTask.breakDuration,
      tags: updatedTask.tags,
      est: updatedTask.est,
    })
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      // 保持原来的 id 和创建时间，更新内容
      tasks.value[index] = { ...tasks.value[index], ...updatedTask }
    }
  } catch (e) {
    console.error('更新任务失败:', e)
  }
}

export const clearCurrentTask = () => {
  currentTask.value = null
  resetTimer()
}

export const deleteTask = async (id: number) => {
  try {
    await invoke('delete_task_in_db', { id })

    tasks.value = tasks.value.filter((t) => t.id !== id)
    if (currentTask.value?.id === id) {
      clearCurrentTask()
    }
  } catch (e) {
    console.error('删除任务失败:', e)
  }
}

// 【关键修复】startFocus: 增加防重判读
export const startFocus = (task?: Task) => {
  // 1. 检查是否是同一个任务
  const isSameTask = task && currentTask.value && task.id === currentTask.value.id
  // 2. 检查是否都是自由模式（没传任务且当前也没任务）
  const isSameFreeMode = !task && !currentTask.value

  // 如果是同一个任务，或者都是自由模式 -> 仅跳转视图，不重置状态
  if (isSameTask || isSameFreeMode) {
    currentView.value = 'focus'
    return
  }

  // --- 以下是开启新任务的逻辑 ---

  isOvertime.value = false
  overtimeSeconds.value = 0

  if (task) {
    currentTask.value = task
    mode.value = task.mode

    pauseTimer()
    if (task.mode === 'timer') {
      timerDuration.value = task.duration * 60
      timeLeft.value = timerDuration.value
    } else {
      timeElapsed.value = 0
    }

    // 只有在【确实开启了新任务】时，才自动进入小窗
    if (!isMini.value) {
      toggleMiniMode()
    }
    startTimer()
  } else {
    currentTask.value = null
    mode.value = 'timer'
    resetTimer()
    pauseTimer()
  }

  currentView.value = 'focus'
}

export const backToDashboard = () => {
  // 注意：这里不要 pauseTimer()，否则切回列表时任务会暂停，不符合后台运行预期
  currentView.value = 'dashboard'
  if (isMini.value) {
    toggleMiniMode()
  }
}
