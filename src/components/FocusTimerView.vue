<script setup lang="ts">
import { computed } from 'vue'
import { Play, Pause, RotateCcw, Timer, Watch, ArrowLeft, Check, Coffee } from 'lucide-vue-next'

import {
  displayTime,
  progressPercentage,
  themeColor,
  mode,
  isRunning,
  isOvertime,
  currentTask,
  estimatedTime,
  toggleTimer,
  resetTimer,
  toggleMode,
  backToDashboard,
  formatTime,
  completeTask,
  startBreak,
  timeLeft,
  timerDuration,
} from '../store'

// ----------------------------------------------------------------
// 动作包装
// ----------------------------------------------------------------
const handleTakeBreak = () => startBreak(5)
const handleComplete = () => completeTask()

// ----------------------------------------------------------------
// 状态文案
// ----------------------------------------------------------------
const statusText = computed(() => {
  if (mode.value === 'stopwatch') {
    return isRunning.value ? '正计时进行中...' : '已暂停'
  }
  if (isRunning.value) return '保持专注...'
  const isAtStart = timeLeft.value === timerDuration.value
  return isAtStart ? '准备开始' : '已暂停'
})

// ----------------------------------------------------------------
// SVG 圆环参数 (优化版：半径 150，视觉更舒展)
// ----------------------------------------------------------------
const radius = 150 // 半径加大：130 -> 150 (直径 300px)
const stroke = 5
const normalizedRadius = radius - stroke * 2
const circumference = normalizedRadius * 2 * Math.PI

const strokeDashoffset = computed(() => {
  if (isOvertime.value) return 0
  const offset = circumference - (progressPercentage.value / 100) * circumference
  return offset
})

const strokeColorClass = computed(() => {
  if (isOvertime.value) return 'stroke-rose-500'
  if (mode.value === 'break') return 'stroke-indigo-400'
  return mode.value === 'timer' ? 'stroke-emerald-400' : 'stroke-sky-400'
})
</script>

<template>
  <div class="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-950">
    <div
      class="absolute top-0 left-0 right-0 h-14 flex items-center px-6 mt-6 z-50 pointer-events-none"
    >
      <button
        @click="backToDashboard"
        class="pointer-events-auto p-2 -ml-2 text-slate-500 hover:text-white transition rounded-lg hover:bg-white/5 flex items-center gap-2 cursor-pointer bg-slate-950/50 backdrop-blur-sm border border-white/5"
        title="返回清单"
      >
        <ArrowLeft :size="18" />
        <span class="text-sm font-medium">列表</span>
      </button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
      <template v-if="!isOvertime">
        <div
          class="mb-6 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div
            v-if="currentTask"
            class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-300 shadow-xl"
          >
            <component
              :is="currentTask.mode === 'timer' ? Timer : Watch"
              :size="14"
              :class="themeColor"
            />
            <span class="font-medium max-w-[200px] truncate">{{ currentTask.title }}</span>
          </div>
          <div v-else class="text-slate-500 text-sm font-medium tracking-wide uppercase">
            自由专注模式
          </div>
        </div>

        <div class="relative flex items-center justify-center mb-8">
          <svg
            :height="radius * 2"
            :width="radius * 2"
            class="transform -rotate-90 pointer-events-none"
          >
            <circle
              class="text-slate-800/50 stroke-current"
              :stroke-width="stroke"
              fill="transparent"
              :r="normalizedRadius"
              :cx="radius"
              :cy="radius"
            />
            <circle
              class="transition-all duration-1000 ease-linear"
              :class="[
                strokeColorClass,
                isRunning ? 'filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : '',
              ]"
              :stroke-width="stroke"
              :stroke-dasharray="circumference + ' ' + circumference"
              :style="{ strokeDashoffset }"
              stroke-linecap="round"
              fill="transparent"
              :r="normalizedRadius"
              :cx="radius"
              :cy="radius"
            />
          </svg>

          <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div
              class="absolute inset-0 rounded-full blur-[60px] opacity-10 transition-all duration-1000"
              :class="[
                mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500',
                isRunning ? 'opacity-20 scale-110' : 'opacity-5 scale-100',
              ]"
            ></div>

            <h1
              class="relative font-mono text-7xl font-bold tracking-wider drop-shadow-2xl transition-colors duration-300 select-none"
              :class="themeColor"
            >
              {{ displayTime }}
            </h1>
          </div>
        </div>

        <div class="h-6 mb-6 text-slate-500 text-sm transition-all duration-300">
          <span v-if="mode === 'stopwatch' && !isRunning"
            >预计耗时: {{ formatTime(estimatedTime) }}</span
          >
          <span v-else>{{ statusText }}</span>
        </div>

        <div class="flex items-center gap-6">
          <button
            @click="resetTimer"
            class="p-3 rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title="放弃/重置"
          >
            <RotateCcw :size="20" />
          </button>

          <button
            @click="handleTakeBreak"
            class="p-3 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition active:scale-95 cursor-pointer"
            title="休息一下"
          >
            <Coffee :size="20" />
          </button>

          <button
            @click="toggleTimer"
            class="p-6 rounded-[2rem] transition-all duration-300 shadow-2xl hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center border border-white/5 cursor-pointer bg-slate-900 group"
            :class="isRunning ? 'ring-2 ring-emerald-500/20' : 'hover:bg-slate-800'"
          >
            <component
              :is="isRunning ? Pause : Play"
              :size="36"
              fill="currentColor"
              class="transition-colors duration-300"
              :class="mode === 'timer' ? 'text-emerald-500' : 'text-sky-500'"
            />
          </button>

          <button
            v-if="currentTask"
            @click="handleComplete"
            class="p-3 rounded-full text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition active:scale-95 cursor-pointer"
            title="提前完成任务"
          >
            <Check :size="20" />
          </button>

          <button
            v-else
            @click="toggleMode"
            class="p-3 rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            :title="mode === 'timer' ? '切换到正计时' : '切换到倒计时'"
          >
            <component :is="mode === 'timer' ? Watch : Timer" :size="20" />
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mb-8 animate-in fade-in zoom-in duration-500">
          <div
            class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 shadow-xl"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span class="font-bold tracking-wide">超时模式</span>
          </div>
        </div>

        <div class="relative flex items-center justify-center mb-10">
          <svg
            :height="radius * 2"
            :width="radius * 2"
            class="transform -rotate-90 pointer-events-none"
          >
            <circle
              class="text-rose-500 stroke-current animate-pulse-slow filter drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
              :stroke-width="stroke"
              fill="transparent"
              :r="normalizedRadius"
              :cx="radius"
              :cy="radius"
            />
          </svg>

          <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h1
              class="relative font-mono text-7xl font-bold tracking-wider drop-shadow-2xl select-none text-rose-500 animate-pulse"
            >
              {{ displayTime }}
            </h1>
            <div
              class="absolute bottom-16 text-rose-500/50 font-medium tracking-widest text-sm uppercase"
            >
              Overtime
            </div>
          </div>
        </div>

        <div class="flex items-center gap-5 animate-in slide-in-from-bottom-8 duration-500">
          <button
            @click="handleTakeBreak"
            class="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 min-w-[120px] cursor-pointer group"
          >
            <div
              class="p-3 rounded-full transition-all duration-300 group-hover:scale-110 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
            >
              <Coffee :size="24" />
            </div>
            <span class="text-indigo-200 font-medium text-sm">休息一下</span>
          </button>

          <button
            @click="handleComplete"
            class="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 min-w-[120px] cursor-pointer group"
          >
            <div
              class="p-3 rounded-full transition-all duration-300 group-hover:scale-110 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
            >
              <Check :size="24" />
            </div>
            <span class="text-emerald-200 font-medium text-sm">完成任务</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-variant-numeric: tabular-nums;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
