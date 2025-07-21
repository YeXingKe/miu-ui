<template>
  <el-select v-model="selectedValue" placeholder="请选择" :loading="loading" v-bind="$attrs">
    <slot name="prefix"></slot>
    <slot name="empty"></slot>
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.label" :disabled="item.disabled">
      <slot :scope="item"></slot>
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { SelectOptions } from './select'

// interface FetchSelectProps {
//   apiFun: () => Promise<any[]>
// }
const loading = ref(false)
defineOptions({
  name: 'MiuSelect'
})
const props = withDefaults(
  defineProps<{
    selectedValue?: string | number
    options?: Array<SelectOptions>
    apiFun?: Function
  }>(),
  { selectedValue: '', options: [] as any, apiFun: () => Promise<any[]> }
)

console.log(props.options)
let options = ref<SelectOptions[]>(props.options)
let selectedValue = ref(props.selectedValue)

const loadData = () => {
  loading.value = true
  options.value = []
  return (
    props.apiFun &&
    props.apiFun().then(
      (data: any) => {
        loading.value = false
        options.value = data
        return data
      },
      (err: any) => {
        loading.value = false
        options.value = [{ value: '-1', label: err.message, disabled: true }]
        return Promise.reject(err)
      }
    )
  )
}

let emits = defineEmits(['selected-value'])

watch(selectedValue, (val: any) => {
  if (val) {
    emits('selected-value', val)
  }
})

onMounted(async () => {
  if (props.apiFun) {
    await loadData()
  }
})
</script>
