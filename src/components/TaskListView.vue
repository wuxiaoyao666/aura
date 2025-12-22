<script setup lang="ts">
import { computed } from 'vue'
import {
  Play,
  Plus,
  Trash2,
  Clock,
  Zap,
  LayoutList,
  Timer,
  Watch,
  ArrowDown,
  Activity,
  Maximize2,
} from 'lucide-vue-next'

// 直接引入 currentTask，这是核心状态
import { tasks, deleteTask, startFocus, currentTask } from '../store'

const emit = defineEmits(['open-create'])

// 计算当前正在运行的任务ID
// 只要 currentTask 有值，它的 ID 就是“正在进行”的 ID
const activeTaskId = computed(() => currentTask.value?.id)
</script>

<template>
  <div class="flex-1 flex flex-col h-full relative">
    <div class="px-6 pt-4 pb-4">
      <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <LayoutList :size="24" class="text-emerald-400" />
        今日任务
      </h1>
      <p class="text-slate-500 text-sm mt-1">保持专注，逐个击破。</p>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide relative">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="group rounded-xl p-4 transition-all cursor-default flex items-center justify-between border relative overflow-hidden"
        :class="[
          // 判断逻辑：如果任务ID 等于 当前运行的任务ID，就高亮
          task.id === activeTaskId
            ? 'bg-emerald-900/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10'
            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900',
        ]"
      >
        <div
          v-if="task.id === activeTaskId"
          class="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"
        ></div>

        <div class="flex items-center gap-4 min-w-0 z-10">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
            :class="
              task.id === activeTaskId
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                : task.mode === 'timer'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-sky-500/10 text-sky-500'
            "
          >
            <Activity v-if="task.id === activeTaskId" :size="20" class="animate-pulse" />
            <component v-else :is="task.mode === 'timer' ? Timer : Watch" :size="20" />
          </div>

          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="text-base font-medium truncate"
                :class="task.id === activeTaskId ? 'text-emerald-400' : 'text-slate-200'"
              >
                {{ task.title }}
              </span>
              <span
                v-if="task.id === activeTaskId"
                class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 animate-pulse"
              >
                进行中
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span v-if="task.mode === 'timer'" class="flex items-center gap-1">
                <Clock :size="12" /> {{ task.duration }} 分钟
              </span>
              <span v-else class="flex items-center gap-1"> <Watch :size="12" /> 正计时 </span>
              <span v-if="task.tags && task.tags.length" class="flex gap-1">
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="bg-slate-800 px-1.5 rounded text-slate-400"
                  >#{{ tag }}</span
                >
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 z-10">
          <button
            @click="startFocus(task)"
            class="p-2 rounded-lg transition-colors cursor-pointer"
            :class="
              task.id === activeTaskId
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 hover:bg-emerald-600 text-emerald-500 hover:text-white'
            "
            :title="task.id === activeTaskId ? '回到专注页面' : '开始此任务'"
          >
            <Maximize2 v-if="task.id === activeTaskId" :size="18" />
            <Play v-else :size="18" fill="currentColor" class="opacity-90" />
          </button>

          <button
            v-if="task.id !== activeTaskId"
            @click="deleteTask(task.id)"
            class="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="删除任务"
          >
            <Trash2 :size="18" />
          </button>
        </div>
      </div>

      <div
        v-if="tasks.length === 0"
        class="flex flex-col items-center justify-center py-20 text-slate-600 h-full"
      >
        <div class="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <LayoutList :size="32" class="opacity-50" />
        </div>
        <p>还没有任务，添加一个开始吧</p>
        <div
          class="absolute bottom-4 right-10 flex flex-col items-center animate-bounce text-emerald-500/80 z-10 pointer-events-none"
        >
          <span class="text-xs font-bold tracking-widest mb-1">开始第一步</span>
          <ArrowDown :size="24" />
        </div>
      </div>
    </div>

    <div
      class="h-20 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md absolute bottom-0 left-0 right-0 px-6 flex items-center justify-between z-20"
    >
      <button
        @click="activeTaskId ? startFocus(tasks.find((t) => t.id === activeTaskId)) : startFocus()"
        class="flex items-center gap-2 text-slate-400 hover:text-white transition font-medium px-4 py-2 hover:bg-slate-900 rounded-lg cursor-pointer"
        :class="activeTaskId ? 'text-emerald-400 animate-pulse' : ''"
      >
        <component :is="activeTaskId ? Activity : Zap" :size="18" />
        {{ activeTaskId ? '回到专注' : '自由专注' }}
      </button>

      <button
        @click="$emit('open-create')"
        class="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition active:scale-95 cursor-pointer"
      >
        <Plus :size="20" />
        新建任务
      </button>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
