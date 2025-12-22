<script setup lang="ts">
import { Play, Plus, Trash2, Clock, Zap, LayoutList, Timer, Watch } from 'lucide-vue-next'
import { tasks, deleteTask, startFocus } from '../store'

const emit = defineEmits(['open-create'])
</script>

<template>
  <div class="flex-1 flex flex-col h-full">
    <div class="px-6 pt-4 pb-4">
      <h1 class="text-2xl font-bold text-slate-100 flex items-center gap-2">
        <LayoutList :size="24" class="text-emerald-400" />
        今日任务
      </h1>
      <p class="text-slate-500 text-sm mt-1">保持专注，逐个击破。</p>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-20 space-y-3 scrollbar-hide">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="group bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all hover:bg-slate-900 cursor-default flex items-center justify-between"
      >
        <div class="flex items-center gap-4 min-w-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            :class="
              task.mode === 'timer'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-sky-500/10 text-sky-500'
            "
          >
            <component :is="task.mode === 'timer' ? Timer : Watch" :size="20" />
          </div>

          <div class="flex flex-col min-w-0">
            <span class="text-base font-medium text-slate-200 truncate">{{ task.title }}</span>
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

        <div class="flex items-center gap-2">
          <button
            @click="startFocus(task)"
            class="p-2 bg-slate-800 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="开始此任务"
          >
            <Play :size="18" fill="currentColor" class="opacity-90" />
          </button>

          <button
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
        class="flex flex-col items-center justify-center py-12 text-slate-600"
      >
        <div class="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <LayoutList :size="32" class="opacity-50" />
        </div>
        <p>还没有任务，添加一个开始吧</p>
      </div>
    </div>

    <div
      class="h-20 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md absolute bottom-0 left-0 right-0 px-6 flex items-center justify-between z-20"
    >
      <button
        @click="startFocus()"
        class="flex items-center gap-2 text-slate-400 hover:text-white transition font-medium px-4 py-2 hover:bg-slate-900 rounded-lg cursor-pointer"
      >
        <Zap :size="18" />
        自由专注
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
