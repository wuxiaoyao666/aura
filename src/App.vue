<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { Play, Pause, RotateCcw, MonitorPlay, Maximize2, Timer, Watch } from 'lucide-vue-next'

// --- 类型定义 ---
type Mode = 'timer' | 'stopwatch'

// --- 状态管理 ---
const isMini = ref(false)
const mode = ref<Mode>('timer')
const isRunning = ref(false)

// 时间相关 (单位: 秒)
const defaultPomodoroTime = 25 * 60
const timeLeft = ref(defaultPomodoroTime) // 倒计时剩余
const timeElapsed = ref(0) // 正计时经过
const estimatedTime = ref(30 * 60) // 预估时间 (用于正计时进度条演示)

let timerInterval: number | null = null

// --- 计算属性 ---

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const displayTime = computed(() => {
  return mode.value === 'timer' ? formatTime(timeLeft.value) : formatTime(timeElapsed.value)
})

const progressPercentage = computed(() => {
  if (mode.value === 'timer') {
    return (timeLeft.value / defaultPomodoroTime) * 100
  } else {
    const pct = (timeElapsed.value / estimatedTime.value) * 100
    return Math.min(pct, 100)
  }
})

const themeColor = computed(() => {
  if (mode.value === 'timer') return 'text-emerald-400'
  return timeElapsed.value > estimatedTime.value ? 'text-rose-400' : 'text-sky-400'
})

const progressColor = computed(() => {
  if (mode.value === 'timer') return 'bg-emerald-500'
  return timeElapsed.value > estimatedTime.value ? 'bg-rose-500' : 'bg-sky-500'
})

// --- 逻辑控制 (核心修改部分) ---

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  if (isRunning.value) return // 防止重复启动
  isRunning.value = true

  // 🚀 核心修复：基于时间戳计算，防止后台变慢
  const now = Date.now()
  let endTime = 0 // 倒计时模式：目标结束时间戳
  let startTime = 0 // 正计时模式：开始时间戳

  if (mode.value === 'timer') {
    // 倒计时：目标时间 = 当前时间 + 剩余秒数
    endTime = now + timeLeft.value * 1000
  } else {
    // 正计时：开始时间 = 当前时间 - 已经过去的秒数
    startTime = now - timeElapsed.value * 1000
  }

  // 使用 setInterval 更新 UI，但数据源自时间戳差值
  timerInterval = setInterval(() => {
    const currentNow = Date.now()

    if (mode.value === 'timer') {
      // 倒计时逻辑
      const remainingMs = endTime - currentNow
      // 向上取整，避免 0.9秒 显示为 0秒
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0) {
        timeLeft.value = 0
        pauseTimer()
        // 这里可以加一个结束提醒，比如 invoke('notify')
      } else {
        timeLeft.value = remainingSec
      }
    } else {
      // 正计时逻辑
      const elapsedMs = currentNow - startTime
      timeElapsed.value = Math.floor(elapsedMs / 1000)
    }
  }, 200) // 💡 刷新频率提高到 200ms，让 UI 更跟手，反正计算是精准的
}

const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  pauseTimer()
  if (mode.value === 'timer') {
    timeLeft.value = defaultPomodoroTime
  } else {
    timeElapsed.value = 0
  }
}

const switchMode = (newMode: Mode) => {
  pauseTimer()
  mode.value = newMode
  if (newMode === 'timer') {
    timeLeft.value = defaultPomodoroTime
  } else {
    timeElapsed.value = 0
  }
}

const toggleMiniMode = async () => {
  isMini.value = !isMini.value
  await invoke('toggle_mini_mode', { isMini: isMini.value })
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div
    class="h-screen w-screen overflow-hidden bg-slate-900 text-slate-200 select-none flex flex-col relative transition-all duration-300 border border-slate-700/50"
    :class="{ 'rounded-xl': !isMini }"
  >
    <div
      v-if="!isMini"
      data-tauri-drag-region
      class="h-8 w-full flex items-center justify-end px-2 cursor-move hover:bg-white/5 transition z-50"
    >
      <button @click="toggleMiniMode" class="p-1 hover:text-white text-slate-500 transition">
        <component :is="isMini ? Maximize2 : MonitorPlay" size="16" />
      </button>
    </div>

    <div
      v-if="isMini"
      class="flex-1 flex flex-col items-center justify-center relative w-full h-full"
    >
      <div class="font-mono text-5xl font-bold tracking-tighter drop-shadow-lg" :class="themeColor">
        {{ displayTime }}
      </div>
      <div class="w-full h-1 bg-slate-800 absolute bottom-0 left-0">
        <div
          class="h-full transition-all duration-1000"
          :class="progressColor"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <div
        data-tauri-drag-region
        class="absolute inset-0 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 bg-slate-900/90 transition-opacity"
      >
        <button
          @click="toggleTimer"
          class="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
        >
          <component :is="isRunning ? Pause : Play" size="24" />
        </button>

        <button
          @click="toggleMiniMode"
          class="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
        >
          <Maximize2 size="24" />
        </button>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center px-8 pt-2 pb-8">
      <div
        class="flex gap-2 p-1 bg-slate-800/50 rounded-full mb-8 backdrop-blur-sm border border-white/5"
      >
        <button
          @click="switchMode('timer')"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="
            mode === 'timer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <Timer size="14" /> Focus
        </button>
        <button
          @click="switchMode('stopwatch')"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          :class="
            mode === 'stopwatch'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <Watch size="14" /> Track
        </button>
      </div>

      <div class="relative group cursor-default">
        <div
          class="absolute -inset-4 rounded-full blur-2xl opacity-20 transition-colors duration-1000"
          :class="mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'"
        ></div>

        <h1
          class="relative font-mono text-8xl font-bold tracking-wider drop-shadow-2xl transition-colors duration-300"
          :class="themeColor"
        >
          {{ displayTime }}
        </h1>
      </div>

      <div v-if="mode === 'stopwatch'" class="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span>Estimated: {{ formatTime(estimatedTime) }}</span>
      </div>
      <div v-else class="mt-4 text-xs text-slate-500">Time until break</div>

      <div
        class="w-full max-w-xs h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden border border-white/5"
      >
        <div
          class="h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor]"
          :class="progressColor"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <div class="flex items-center gap-6 mt-10">
        <button
          @click="resetTimer"
          class="p-4 rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition active:scale-95"
          title="Reset"
        >
          <RotateCcw size="20" />
        </button>

        <button
          @click="toggleTimer"
          class="p-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center border border-white/10"
          :class="
            mode === 'timer'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40'
          "
        >
          <component
            :is="isRunning ? Pause : Play"
            size="32"
            fill="currentColor"
            class="opacity-90"
          />
        </button>

        <div class="w-12"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 针对数字字体的微调 */
.font-mono {
  font-variant-numeric: tabular-nums;
}
</style>
