<template>
  <el-cascader v-model="selectedValue" :options="regionData.all" :props="cascaderConfig" placeholder="请选择" @change="handleChange"></el-cascader>
</template>
<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { ref, onMounted, reactive } from 'vue'
import type { ChooseCityProps } from './choose-city'
import { getCities, getCounties, getProvinces, getRegionData } from 'region-data'
import type { CascaderProps } from 'element-plus'

defineOptions({
  name: 'MiuChooseCity'
})
const regionData = reactive({
  all: getRegionData(),
  provice: getProvinces(),
  city: getCities(),
  county: getCounties()
})

let emits = defineEmits(['changeCity', 'changeProvince']) // 分发事件
console.log(regionData)
const props = withDefaults(defineProps<ChooseCityProps>(), { selectedValue: '', label: 'name', value: 'code' })
const cascaderConfig = reactive<CascaderProps>({ label: props.label, value: props.value })
const selectedValue = ref(props.selectedValue)

onMounted(() => {})

const handleChange = () => {}
</script>
