<script setup lang="ts">
import { Play, Pause, RotateCcw, Timer, Watch, Plus, X, Clock } from 'lucide-vue-next'
import {
  displayTime,
  themeColor,
  mode,
  isRunning,
  currentTask,
  tasks,
  toggleTimer,
  resetTimer,
  toggleMode,
  loadTask,
  deleteTask,
  clearCurrentTask,
} from '../store'

const emit = defineEmits(['open-create'])
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="flex flex-col items-center justify-center py-6 shrink-0 relative">
      <div
        v-if="currentTask"
        class="absolute top-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2"
      >
        <component
          :is="currentTask.mode === 'timer' ? Timer : Watch"
          :size="12"
          :class="themeColor"
        />
        <span class="font-medium">{{ currentTask.title }}</span>
        <button @click="clearCurrentTask" class="hover:text-rose-400 ml-1 cursor-pointer">
          <X :size="12" />
        </button>
      </div>

      <div class="relative group cursor-default mb-6 mt-4">
        <div
          class="absolute -inset-6 rounded-full blur-3xl opacity-10 transition-colors duration-1000"
          :class="mode === 'timer' ? 'bg-emerald-500' : 'bg-sky-500'"
        ></div>
        <h1
          class="relative font-mono text-7xl font-bold tracking-wider drop-shadow-2xl transition-colors duration-300 select-none"
          :class="themeColor"
        >
          {{ displayTime }}
        </h1>
      </div>

      <div class="flex items-center gap-6">
        <button
          @click="resetTimer"
          class="p-3 rounded-full text-slate-500 hover:bg-white/5 hover:text-white transition cursor-pointer"
        >
          <RotateCcw :size="20" />
        </button>

        <button
          @click="toggleTimer"
          class="p-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center border border-white/5 cursor-pointer"
          :class="
            mode === 'timer'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
          "
        >
          <component
            :is="isRunning ? Pause : Play"
            :size="28"
            fill="currentColor"
            class="opacity-90"
          />
        </button>

        <button
          v-if="!currentTask"
          @click="toggleMode"
          class="p-3 rounded-full text-slate-500 hover:bg-white/5 hover:text-white transition cursor-pointer"
          :title="mode === 'timer' ? '切换到正计时' : '切换到倒计时'"
        >
          <component :is="mode === 'timer' ? Watch : Timer" :size="20" />
        </button>
        <div v-else class="w-[44px]"></div>
      </div>
    </div>

    <div class="flex-1 bg-slate-900/50 border-t border-slate-800 flex flex-col min-h-0">
      <div class="flex items-center justify-between px-4 py-3 shrink-0">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">待办事项</span>
        <button
          @click="$emit('open-create')"
          class="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 transition cursor-pointer"
        >
          <Plus :size="14" /> 新建任务
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="group flex items-center justify-between p-3 rounded-lg border bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
          :class="
            currentTask?.id === task.id ? 'ring-1 ring-inset ring-emerald-500/50 bg-slate-800' : ''
          "
        >
          <div class="flex items-center gap-3 overflow-hidden" @click="loadTask(task)">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              :class="
                task.mode === 'timer'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-sky-500/10 text-sky-500'
              "
            >
              <component :is="task.mode === 'timer' ? Timer : Watch" :size="16" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium text-slate-200 truncate">{{ task.title }}</span>
              <div class="flex items-center gap-2 text-[10px] text-slate-500">
                <span v-if="task.mode === 'timer'" class="flex items-center gap-0.5"
                  ><Clock :size="10" /> {{ task.duration }}m</span
                >
                <span v-else class="flex items-center gap-0.5">正计时</span>
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="bg-slate-700 px-1.5 rounded text-slate-400"
                  >#{{ tag }}</span
                >
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="loadTask(task)"
              class="p-1.5 hover:bg-emerald-500 hover:text-white text-slate-500 rounded transition"
              title="开始此任务"
            >
              <Play :size="14" />
            </button>
            <button
              @click.stop="deleteTask(task.id)"
              class="p-1.5 hover:bg-rose-500 hover:text-white text-slate-500 rounded transition"
              title="删除"
            >
              <X :size="14" />
            </button>
          </div>
        </div>

        <div
          v-if="tasks.length === 0"
          class="flex flex-col items-center justify-center h-24 text-slate-600 text-sm italic"
        >
          <span>暂无任务</span>
          <span class="text-xs mt-1">点击右上角添加新任务</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-variant-numeric: tabular-nums;
}
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
