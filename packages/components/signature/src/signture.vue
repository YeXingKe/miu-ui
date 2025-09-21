<template>
  <div class="sign-container">
    <div class="sign-area" ref="canvasContainerRef">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing"
      ></canvas>
    </div>
    <div class="button-area">
      <!-- <el-button @click="close">关 闭</el-button> -->
      <slot name="buttonArea"></slot>
      <el-button @click="clearCanvas" data-testid="clear-btn">清 除</el-button>
      <el-button class="ml-2" type="primary" @click="saveSignature" data-testid="save-btn"> 保 存 </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Util } from '@miu-ui/utils'
// import { ElMessage } from 'element-plus'

defineOptions({
  name: 'MiuSignture',
  // 为了让我们能够完全自主地控制那些“未声明为 props 的属性”应该绑定到哪个具体的元素或组件上，
  // 而不是让 Vue 默认地、可能是不正确地将其应用到组件的根元素上
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
    lineColor?: string
    lineWidth?: number
  }>(),
  { width: 500, height: 300, lineColor: '#000', lineWidth: 2 }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContainerRef = ref<HTMLElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const hasDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)

// 初始化画布
onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  if (canvasContainerRef.value) {
    initCanvasSize()
    redrawCanvas()
  }
}
// 初始化画布大小
const initCanvasSize = () => {
  if (canvasContainerRef.value) {
    // 赋值容器宽度
    canvasWidth.value = canvasContainerRef.value.clientWidth
  }

  if (canvasRef.value) {
    canvasRef.value.width = canvasWidth.value
    canvasRef.value.height = canvasHeight.value
  }
}

// 初始化画布
const initCanvas = () => {
  if (!canvasRef.value) return

  initCanvasSize() // 初始化画布大小
  ctx.value = canvasRef.value.getContext('2d')
  initContext() // 初始化画布内容
}

// 初始化上下文设置
const initContext = () => {
  if (!ctx.value) return
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.lineWidth = props.lineWidth
  ctx.value.strokeStyle = props.lineColor
}

// 开始绘制（鼠标）
const startDrawing = e => {
  if (!ctx.value || !canvasRef.value) return

  isDrawing.value = true
  hasDrawing.value = true
  const rect = canvasRef.value.getBoundingClientRect() // 提供了元素的大小及其相对于视口(viewport)的位置信息
  lastX.value = e.clientX - rect.left
  lastY.value = e.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX.value, lastY.value)
}

// 绘制（鼠标）
const draw = e => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left // 元素左边相对于视口左边的距离
  const currentY = e.clientY - rect.top // 元素顶部相对于视口顶部的距离

  ctx.value.lineTo(currentX, currentY)
  ctx.value.stroke()

  lastX.value = currentX
  lastY.value = currentY
}

// 开始绘制（触摸）
const startDrawingTouch = e => {
  if (!ctx.value || !canvasRef.value) return
  e.preventDefault()
  isDrawing.value = true
  hasDrawing.value = true
  const rect = canvasRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  lastX.value = touch.clientX - rect.left
  lastY.value = touch.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX.value, lastY.value)
}

// 绘制（触摸）
const drawTouch = e => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  e.preventDefault()
  const rect = canvasRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  const currentX = touch.clientX - rect.left
  const currentY = touch.clientY - rect.top

  ctx.value.lineTo(currentX, currentY)
  ctx.value.stroke()

  lastX.value = currentX
  lastY.value = currentY
}

// 停止绘制
const stopDrawing = () => {
  isDrawing.value = false
}

// 清除画布
const clearCanvas = () => {
  if (!ctx.value) return

  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  initContext()
  hasDrawing.value = false
}

// // 改变线条颜色
// const changeColor = color => {
//   currentColor.value = color
//   if (ctx.value) {
//     ctx.value.strokeStyle = color
//   }
// }

// // 改变线条宽度
// const changeWidth = width => {
//   currentWidth.value = width
//   if (ctx.value) {
//     ctx.value.lineWidth = width
//   }
// }

// 重绘画布（响应式调整时）
const redrawCanvas = () => {
  // 在实际应用中，你可能需要实现保存和恢复绘图数据的功能
  // 这里只是简单重新初始化画布
  initContext()
}

const emits = defineEmits(['save'])
// 保存签名
const saveSignature = () => {
  if (!canvasRef.value || !hasDrawing.value) return

  try {
    const signatureDataUrl = canvasRef.value.toDataURL('image/png') // 默认转成png格式的图片编码，这是base-64格式图片
    const fileName = Date.now() // 用时间戳做文件名
    const file = Util.dataURLtoFile(signatureDataUrl, fileName + '') // 图片文件信息，传给后端存储
    emits('save', { fileInfo: file, imageData: signatureDataUrl }) // 暴露出去的信息
  } catch (error) {
    console.error('save error:', error)
  }
}

defineExpose({
  ctx
})
</script>
