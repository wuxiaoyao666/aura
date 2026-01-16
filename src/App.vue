<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MonitorPlay } from 'lucide-vue-next'
import { isMini, toggleMiniMode, currentView, loadTasks } from './store'
import type { Task } from './types'

import MiniView from './components/MiniView.vue'
import TaskListView from './components/TaskListView.vue'
import FocusTimerView from './components/FocusTimerView.vue'
import TaskCreateModal from './components/TaskCreateModal.vue'

const showCreateModal = ref(false)
// 当前正在编辑的任务
const editingTask = ref<Task | null>(null)

// 打开新建
const openCreate = () => {
  // 清空编辑状态
  editingTask.value = null
  showCreateModal.value = true
}

// 打开编辑
const openEdit = (task: Task) => {
  // 设置当前编辑的任务
  editingTask.value = task
  showCreateModal.value = true
}

// 关闭模态框
const closeModal = () => {
  showCreateModal.value = false
  setTimeout(() => {
    editingTask.value = null
  }, 300) // 等动画结束再清空
}

onMounted(() => {
  // 启动时从数据库读数据
  loadTasks()
})
</script>

<template>
  <div
    @contextmenu.prevent
    class="h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 select-none flex flex-col relative transition-all duration-300"
    :class="!isMini ? 'rounded-xl border border-slate-800' : ''"
  >
    <div
      v-if="!isMini"
      data-tauri-drag-region
      class="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-3 z-50 hover:bg-white/5 transition"
    >
      <button
        @click="toggleMiniMode"
        class="p-1 text-slate-500 hover:text-white transition cursor-pointer"
        title="迷你模式"
      >
        <MonitorPlay :size="16" />
      </button>
    </div>

    <MiniView v-if="isMini" />

    <template v-else>
      <transition name="fade" mode="out-in">
        <component
          :is="currentView === 'dashboard' ? TaskListView : FocusTimerView"
          @open-create="openCreate"
          @edit-task="openEdit"
          class="pt-8"
        />
      </transition>
    </template>

    <transition name="fade">
      <TaskCreateModal v-if="showCreateModal" :editTask="editingTask" @close="closeModal" />
    </transition>
  </div>
</template>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.font-mono {
  font-variant-numeric: tabular-nums;
}
</style>
