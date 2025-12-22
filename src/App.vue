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

// 时间相关
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

// --- 逻辑控制 ---

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
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
      } else {
        timeLeft.value = remainingSec
      }
    } else {
      const elapsedMs = currentNow - startTime
      timeElapsed.value = Math.floor(elapsedMs / 1000)
    }
  }, 200)
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
      class="h-8 w-full flex items-center justify-end px-2 z-50 hover:bg-white/5 transition"
    >
      <button
        @click="toggleMiniMode"
        class="p-1 hover:text-white text-slate-500 transition cursor-pointer"
        title="切换画中画模式"
      >
        <component :is="isMini ? Maximize2 : MonitorPlay" :size="16" />
      </button>
    </div>

    <div
      v-if="isMini"
      class="flex-1 flex flex-col items-center justify-center relative w-full h-full"
    >
      <div
        class="font-mono text-5xl font-bold tracking-tighter drop-shadow-lg pointer-events-none"
        :class="themeColor"
      >
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
          :title="isRunning ? '暂停' : '开始'"
        >
          <component :is="isRunning ? Pause : Play" :size="24" />
        </button>

        <button
          @click="toggleMiniMode"
          class="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          title="还原窗口"
        >
          <Maximize2 :size="24" />
        </button>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center px-8 pt-2 pb-8 z-10">
      <div
        class="flex gap-2 p-1 bg-slate-800/50 rounded-full mb-8 backdrop-blur-sm border border-white/5"
      >
        <button
          @click="switchMode('timer')"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
          :class="
            mode === 'timer'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <Timer :size="14" /> 专注
        </button>
        <button
          @click="switchMode('stopwatch')"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
          :class="
            mode === 'stopwatch'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <Watch :size="14" /> 正计时
        </button>
      </div>

      <div class="relative group cursor-default">
        <div
          class="absolute -inset-4 rounded-full blur-2xl opacity-20 transition-colors duration-1000"
          :class="mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'"
        ></div>

        <h1
          class="relative font-mono text-8xl font-bold tracking-wider drop-shadow-2xl transition-colors duration-300 pointer-events-none"
          :class="themeColor"
        >
          {{ displayTime }}
        </h1>
      </div>

      <div v-if="mode === 'stopwatch'" class="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span>预计耗时: {{ formatTime(estimatedTime) }}</span>
      </div>
      <div v-else class="mt-4 text-xs text-slate-500">保持专注，直到倒计时结束</div>

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
          class="p-4 rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition active:scale-95 cursor-pointer"
          title="重置"
        >
          <RotateCcw :size="20" />
        </button>

        <button
          @click="toggleTimer"
          class="p-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center border border-white/10 cursor-pointer"
          :class="
            mode === 'timer'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40'
          "
          :title="isRunning ? '暂停' : '开始'"
        >
          <component
            :is="isRunning ? Pause : Play"
            :size="32"
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
.font-mono {
  font-variant-numeric: tabular-nums;
}
</style>
