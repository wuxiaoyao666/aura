<script setup lang="ts">
import { Play, Pause, RotateCcw, Timer, Watch, ArrowLeft } from 'lucide-vue-next'
import {
  displayTime,
  progressPercentage,
  themeColor,
  progressColor,
  mode,
  isRunning,
  currentTask,
  estimatedTime,
  toggleTimer,
  resetTimer,
  toggleMode,
  backToDashboard,
  formatTime,
} from '../store'
</script>

<template>
  <div class="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-950">
    <div
      class="absolute top-0 left-0 right-0 h-16 flex items-center px-6 mt-8 z-50 pointer-events-none"
    >
      <button
        @click="backToDashboard"
        class="pointer-events-auto p-2 -ml-2 text-slate-500 hover:text-white transition rounded-lg hover:bg-white/5 flex items-center gap-2 cursor-pointer bg-slate-950/50 backdrop-blur-sm border border-white/5"
        title="返回清单"
      >
        <ArrowLeft :size="20" />
        <span class="text-sm font-medium">列表</span>
      </button>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center relative z-10 w-full pt-10">
      <div
        class="mb-8 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
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

      <div class="relative group cursor-default mb-12">
        <div
          class="absolute -inset-10 rounded-full blur-[60px] opacity-20 transition-all duration-1000"
          :class="[
            mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500',
            isRunning ? 'opacity-30 scale-110' : 'opacity-10 scale-100',
          ]"
        ></div>
        <h1
          class="relative font-mono text-9xl font-bold tracking-wider drop-shadow-2xl transition-colors duration-300 select-none"
          :class="themeColor"
        >
          {{ displayTime }}
        </h1>
      </div>

      <div class="h-6 mb-10 text-slate-500 text-sm">
        <span v-if="mode === 'stopwatch'">预计耗时: {{ formatTime(estimatedTime) }}</span>
        <span v-else>{{ isRunning ? '保持专注...' : '准备开始' }}</span>
      </div>

      <div class="flex items-center gap-10">
        <button
          @click="resetTimer"
          class="p-4 rounded-full text-slate-600 hover:text-slate-300 hover:bg-slate-900 transition active:scale-95 cursor-pointer"
          title="重置"
        >
          <RotateCcw :size="24" />
        </button>

        <button
          @click="toggleTimer"
          class="p-8 rounded-[2rem] transition-all duration-300 shadow-2xl hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center border border-white/5 cursor-pointer bg-slate-900 group"
          :class="isRunning ? 'ring-2 ring-emerald-500/20' : 'hover:bg-slate-800'"
        >
          <component
            :is="isRunning ? Pause : Play"
            :size="48"
            fill="currentColor"
            class="transition-colors duration-300"
            :class="mode === 'timer' ? 'text-emerald-500' : 'text-sky-500'"
          />
        </button>

        <button
          v-if="!currentTask"
          @click="toggleMode"
          class="p-4 rounded-full text-slate-600 hover:text-slate-300 hover:bg-slate-900 transition active:scale-95 cursor-pointer"
          :title="mode === 'timer' ? '切换到正计时' : '切换到倒计时'"
        >
          <component :is="mode === 'timer' ? Watch : Timer" :size="24" />
        </button>
        <div v-else class="w-[56px]"></div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900">
      <div
        class="h-full transition-all duration-1000 ease-linear shadow-[0_0_15px_currentColor]"
        :class="progressColor"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-variant-numeric: tabular-nums;
}
</style>
