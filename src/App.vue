<script setup lang="ts">
import { ref } from 'vue'
import { MonitorPlay } from 'lucide-vue-next'
import { isMini, toggleMiniMode } from './store'
import MiniView from './components/MiniView.vue'
import MainView from './components/MainView.vue'
import TaskCreateModal from './components/TaskCreateModal.vue'

const showCreateModal = ref(false)
</script>

<template>
  <div
    class="h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 select-none flex flex-col relative transition-all duration-300 border border-slate-800"
    :class="{ 'rounded-xl': !isMini }"
  >
    <div
      v-if="!isMini"
      data-tauri-drag-region
      class="h-8 w-full flex items-center justify-end px-3 z-50 hover:bg-white/5 transition shrink-0"
    >
      <button
        @click="toggleMiniMode"
        class="p-1 hover:text-white text-slate-500 transition cursor-pointer"
        title="迷你模式"
      >
        <MonitorPlay :size="16" />
      </button>
    </div>

    <MiniView v-if="isMini" />
    <MainView v-else @open-create="showCreateModal = true" />

    <TaskCreateModal v-if="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>
