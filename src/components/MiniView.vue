<script setup lang="ts">
import { Play, Pause, Maximize2 } from 'lucide-vue-next'
import {
  displayTime,
  themeColor,
  progressColor,
  progressPercentage,
  currentTask,
  isRunning,
  toggleTimer,
  toggleMiniMode,
} from '../store'
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center relative w-full h-full">
    <div class="font-mono text-5xl font-bold tracking-tighter drop-shadow-lg" :class="themeColor">
      {{ displayTime }}
    </div>

    <div
      v-if="currentTask"
      class="absolute bottom-2 text-[10px] text-slate-400 max-w-[90%] truncate flex items-center gap-1 pointer-events-none"
    >
      <span
        class="w-1.5 h-1.5 rounded-full"
        :class="currentTask.mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'"
      ></span>
      {{ currentTask.title }}
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
        <component :is="isRunning ? Pause : Play" :size="24" />
      </button>
      <button
        @click="toggleMiniMode"
        class="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
      >
        <Maximize2 :size="24" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-variant-numeric: tabular-nums;
}
</style>
