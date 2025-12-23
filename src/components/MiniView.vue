<script setup lang="ts">
import { Play, Pause, Maximize2, Check, Coffee } from 'lucide-vue-next'
import {
  displayTime,
  themeColor,
  progressColor,
  progressPercentage,
  currentTask,
  isRunning,
  mode,
  toggleTimer,
  toggleMiniMode,
  completeTask,
  startBreak,
  endBreak, // 引入新动作
} from '../store'
</script>

<template>
  <div
    class="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-slate-950 overflow-hidden"
  >
    <div class="z-10 flex flex-col items-center gap-1 max-w-[90%] pointer-events-none select-none">
      <div
        v-if="mode === 'break'"
        class="text-xl md:text-2xl font-bold text-indigo-400 text-center leading-tight truncate w-full"
      >
        正在休息
      </div>
      <div
        v-else-if="currentTask"
        class="text-xl md:text-2xl font-bold text-white text-center leading-tight truncate w-full"
      >
        {{ currentTask.title }}
      </div>
      <div v-else class="text-xl font-bold text-slate-400">自由专注</div>

      <div class="font-mono text-sm font-medium transition-colors duration-300" :class="themeColor">
        {{ displayTime }}
      </div>
    </div>

    <div class="w-full h-1 bg-slate-800 absolute bottom-0 left-0">
      <div
        class="h-full transition-all duration-1000"
        :class="progressColor"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>

    <div data-tauri-drag-region class="absolute inset-0 z-20"></div>

    <div
      class="absolute inset-0 flex items-center justify-center gap-3 z-30 opacity-0 hover:opacity-100 bg-slate-950/80 backdrop-blur-sm transition-all duration-200 pointer-events-none"
    >
      <button
        v-if="mode !== 'break'"
        @click="toggleTimer"
        class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer pointer-events-auto transition-colors"
        :title="isRunning ? '暂停' : '开始'"
      >
        <component :is="isRunning ? Pause : Play" :size="20" />
      </button>

      <button
        v-else
        @click="endBreak"
        class="p-2 rounded-full bg-slate-700 hover:bg-emerald-600 text-white cursor-pointer pointer-events-auto transition-colors"
        title="结束休息，开始工作"
      >
        <Play :size="20" class="ml-0.5" />
      </button>

      <button
        v-if="currentTask && mode !== 'break'"
        @click="completeTask"
        class="p-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white cursor-pointer pointer-events-auto transition-colors"
        title="完成任务"
      >
        <Check :size="20" />
      </button>

      <button
        v-if="mode !== 'break'"
        @click="() => startBreak(currentTask?.breakDuration || 5)"
        class="p-2 rounded-full hover:bg-indigo-600 text-indigo-400 hover:text-white cursor-pointer pointer-events-auto transition-colors"
        title="休息 5 分钟"
      >
        <Coffee :size="20" />
      </button>

      <button
        @click="toggleMiniMode"
        class="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer pointer-events-auto transition-colors"
        title="返回主窗口"
      >
        <Maximize2 :size="20" />
      </button>
    </div>
  </div>
</template>
