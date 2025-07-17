<template>
  <el-select v-model="selectedValue" placeholder="请选择" clearable filterable v-bind="$attrs">
    <slot name="prefix"></slot>
    <slot name="empty"></slot>
    <el-option v-for="item in nations" :key="item.value" :label="item.label" :value="item.label">
      <slot :scope="item"></slot>
    </el-option>
  </el-select>
</template>

<script lang="ts" setup>
import nations from './nation'
import { ref } from 'vue'

defineOptions({
  name: 'MiuNation'
})
const props = withDefaults(
  defineProps<{
    selectedValue?: string
  }>(),
  { selectedValue: '' }
)

const selectedValue = ref(props.selectedValue)
</script>
