<template>
  <div>
    <el-button type="primary" @click="sign">{{ btn }}</el-button>
    <miu-dialog :title="title" ref="modalRef" :isCuscomFooter="true">
      <div class="sign-bg">
        <canvas ref="canvasRef" :width="width" :height="height" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup"></canvas>
      </div>
      <template #footer>
        <el-button @click="close">关 闭</el-button>
        <el-button @click="handleClear">清 除</el-button>
        <el-button class="ml-2" type="primary" @click="confirm"> 保 存 </el-button>
      </template>
    </miu-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { MiuDialog } from '@miu-ui/components'
import { Util } from '@miu-ui/utils'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'MiuSignture'
})

const props = defineProps({
  title: {
    type: String,
    default: '电子签名'
  },
  btn: {
    type: String,
    default: '电子签名'
  },
  width: {
    type: Number,
    default: 500
  },
  height: {
    type: Number,
    default: 300
  },
  strokeColor: {
    type: String,
    default: '#000'
  },
  lineWidth: {
    type: Number,
    default: 2
  }
})

let modalRef = ref()
let ctx = ref()
let canvasRef = ref()
let isDraw = ref(false)
let startX = ref(0)
let startY = ref(0)
let points: Array<any> = []
const sign = () => {
  modalRef.value.open()
}
const close = () => {
  modalRef.value.close()
}
const emits = defineEmits(['confirm'])
const confirm = () => {
  if (points.length < 20) {
    ElMessage.error('签名不能为空！')
    return
  }
  const baseFile = canvasRef.value.toDataURL() // 默认转成png格式的图片编码，这是base-64格式图片
  const fileName = Date.now() // 用时间戳做文件名
  const file = Util.dataURLtoFile(baseFile, fileName + '') // 图片文件信息，传给后端存储
  emits('confirm', { fileInfo: file, imageData: baseFile }) // 暴露出去的信息
  modalRef.value.close()
}

function mousedown(event) {
  event.preventDefault()
  startX.value = event.offsetX
  startY.value = event.offsetY
  isDraw.value = true // 开启绘画转态
}

function mousemove(event) {
  event.preventDefault()
  if (!isDraw.value) return
  const obj = {
    x: event.offsetX,
    y: event.offsetY
  }
  ctx.value = canvasRef.value.getContext('2d')
  ctx.value.strokeStyle = props.strokeColor // 线条颜色
  ctx.value.lineWidth = props.lineWidth // 线条宽度
  ctx.value.beginPath() // 开始描绘路径
  ctx.value.moveTo(startX.value, startY.value) // 鼠标按下时直线起点
  ctx.value.lineTo(obj.x, obj.y) // 线条结束坐标
  ctx.value.stroke() // 绘制图形的线条
  ctx.value.closePath() // 闭合绘图路径
  startX.value = obj.x // 更新开始位置
  startY.value = obj.y
  points.push(obj) // 记录坐标
}

function mouseup(event) {
  isDraw.value = false
}

function handleClear() {
  // 清空给定矩形内的指定像素
  ctx.value.clearRect(0, 0, props.width, props.height)
  points = []
}
onMounted(() => {
  // if (modalRef.value.dialogVisible) {
  //   initCanvas()
  // }
})
</script>
<style lang="scss" scoped>
.sign-bg {
  border: 1px solid #efefef;
}
</style>
