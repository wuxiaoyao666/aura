<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Timer, Watch } from 'lucide-vue-next'
import { addTask, updateTask } from '../store'
import type { Mode, Task } from '../types'

const props = defineProps<{
  editTask?: Task | null
}>()

const emit = defineEmits(['close'])

const form = ref({
  title: '',
  mode: 'timer' as Mode,
  duration: 25,
  breakDuration: 5,
  tagInput: '',
})

onMounted(() => {
  if (props.editTask) {
    form.value = {
      title: props.editTask.title,
      mode: props.editTask.mode,
      duration: props.editTask.duration,
      breakDuration: props.editTask.breakDuration || 5,
      tagInput: props.editTask.tags ? props.editTask.tags.join(' ') : '',
    }
  }
})

const handleSubmit = () => {
  if (!form.value.title.trim()) return

  const tags = form.value.tagInput.split(/[,， ]+/).filter((t) => t.trim())

  if (props.editTask) {
    updateTask({
      ...props.editTask,
      title: form.value.title,
      mode: form.value.mode,
      duration: form.value.duration,
      breakDuration: form.value.breakDuration,
      tags: tags,
    })
  } else {
    addTask({
      id: Date.now(),
      title: form.value.title,
      mode: form.value.mode,
      duration: form.value.duration,
      breakDuration: form.value.breakDuration,
      tags: tags,
      act: 0,
      est: 0,
    })
  }

  emit('close')
}
</script>

<template>
  <div
    class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
  >
    <div
      class="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
    >
      <div class="flex justify-between items-center">
        <h3 class="text-slate-200 font-semibold">{{ editTask ? '编辑任务' : '新建任务' }}</h3>
        <button @click="$emit('close')" class="text-slate-500 hover:text-white cursor-pointer">
          <X :size="18" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-slate-500 block mb-1">任务名称</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="例如：阅读《xxx》"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
            autoFocus
            @keydown.enter="handleSubmit"
          />
        </div>

        <div>
          <label class="text-xs text-slate-500 block mb-1">模式选择</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="form.mode = 'timer'"
              class="flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition cursor-pointer"
              :class="
                form.mode === 'timer'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
              "
            >
              <Timer :size="14" /> 专注计时
            </button>
            <button
              @click="form.mode = 'stopwatch'"
              class="flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition cursor-pointer"
              :class="
                form.mode === 'stopwatch'
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
              "
            >
              <Watch :size="14" /> 正向计时
            </button>
          </div>
        </div>

        <div v-if="form.mode === 'timer'">
          <label class="text-xs text-slate-500 block mb-1">专注时长 (分钟)</label>
          <input
            v-model="form.duration"
            type="number"
            min="1"
            max="180"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
            @keydown.enter="handleSubmit"
          />
        </div>

        <div>
          <label class="text-xs text-slate-500 block mb-1">休息时长 (分钟)</label>
          <input
            v-model="form.breakDuration"
            type="number"
            min="1"
            max="60"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none transition"
            @keydown.enter="handleSubmit"
          />
        </div>

        <div>
          <label class="text-xs text-slate-500 block mb-1">标签 (空格分隔)</label>
          <input
            v-model="form.tagInput"
            type="text"
            placeholder="阅读 学习"
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none transition"
            @keydown.enter="handleSubmit"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 pt-2">
        <button
          @click="$emit('close')"
          class="col-span-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition active:scale-95 cursor-pointer"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          class="col-span-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-2.5 rounded-lg transition active:scale-95 cursor-pointer"
        >
          {{ editTask ? '保存修改' : '立即创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
