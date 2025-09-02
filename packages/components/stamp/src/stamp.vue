<template>
  <div>
    <div v-if="!custom">
      <canvas ref="canvasRef" :width="width" :height="height"></canvas>
    </div>
    <template v-if="custom">
      <div>
        <el-button type="primary" @click="generate">{{ btn }}</el-button>
        <miu-dialog :title="title" ref="modalRef">
          <el-row :gutter="24" class="mb-sm">
            <el-col :lg="4" :md="4" class="label">
              <label>印章名称：</label>
            </el-col>
            <el-col :lg="20" :md="20">
              <el-input v-model="innerText" placeholder="XXX专用章" />
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :lg="4" :md="4" class="label">
              <label>公司名称：</label>
            </el-col>
            <el-col :lg="20" :md="20">
              <el-input v-model="outerText" placeholder="公司名称" />
            </el-col>
          </el-row>
          <div style="display: flex; justify-content: center">
            <canvas ref="canvasRef" :width="width" :height="height"></canvas>
          </div>
          <template #footer>
            <el-button @click="close">关 闭</el-button>
            <el-button class="ml-2" type="primary" @click="confirm"> 生成图片 </el-button>
          </template>
        </miu-dialog>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { Util } from '@miu-ui/utils'
import { ref, onMounted } from 'vue'
import { MiuDialog } from '@miu-ui/components'

defineOptions({
  name: 'MiuStamp'
})

const props = defineProps({
  title: {
    type: String,
    default: '签章信息'
  },
  btn: {
    type: String,
    default: '生成签章'
  },
  custom: {
    type: Boolean,
    default: false
  },
  innerText: {
    type: String,
    default: 'XXX专用章'
  },
  outerText: {
    type: String,
    default: 'XXX科技股份有限公司'
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 200
  },
  strokeColor: {
    type: String,
    default: '#f00'
  },
  lineWidth: {
    type: Number,
    default: 2
  }
})

let modalRef = ref()
let canvasRef = ref()
let innerText = ref(props.innerText)
let outerText = ref(props.outerText)
const generate = () => {
  modalRef.value.open()
  stamp(innerText.value, outerText.value)
}
const close = () => {
  innerText.value = ''
  outerText.value = ''
  modalRef.value.close()
}

const emits = defineEmits(['confirm'])
const confirm = () => {
  stamp(innerText.value, outerText.value)
  const baseFile = canvasRef.value.toDataURL() // 默认转成png格式的图片编码，这是base-64格式图片
  const fileName = Date.now() // 用时间戳做文件名
  const file = Util.dataURLtoFile(baseFile, fileName + '') // 图片文件信息，传给后端存储
  emits('confirm', { fileInfo: file, imageData: baseFile }) // 暴露出去的信息
  close()
}

onMounted(() => {
  if (!props.custom) {
    stamp(props.innerText, props.outerText)
  }
})
function stamp(innerText, outerText) {
  let ctx = canvasRef.value.getContext('2d')
  let width = props.width / 2
  let height = props.height / 2

  ctx.lineWidth = props.lineWidth
  ctx.strokeStyle = props.strokeColor
  ctx.beginPath()
  ctx.arc(width, height, 90, 0, Math.PI * 2) // 宽、高、半径
  ctx.stroke()

  create5star(ctx, width, height, 25, props.strokeColor, 0) // 绘画五角星

  // 绘制印章名称
  ctx.font = '20px 宋体'
  ctx.textBaseline = 'middle' //设置文本的垂直对齐方式
  ctx.textAlign = 'center' //设置文本的水平对对齐方式
  ctx.lineWidth = props.lineWidth
  ctx.strokeStyle = props.strokeColor
  ctx.strokeText(innerText, width, height + 60)

  // 绘制印章单位
  ctx.translate(width, height) // 平移到此位置,
  ctx.font = '23px 宋体'
  let count = outerText.length // 字数
  let angle = (4 * Math.PI) / (3 * (count - 1)) // 字间角度
  let chars = outerText.split('')
  let c
  for (let i = 0; i < count; i++) {
    c = chars[i] // 需要绘制的字符
    if (i == 0) {
      ctx.rotate((5 * Math.PI) / 6)
    } else {
      ctx.rotate(angle)
    }

    ctx.save()
    ctx.translate(70, 0) // 平移到此位置,此时字和x轴垂直，公司名称和最外圈的距离
    ctx.rotate(Math.PI / 2) // 旋转90度,让字平行于x轴
    ctx.strokeText(c, 0, 0) // 此点为字的中心点
    ctx.restore()
  }
}

function create5star(ctx, sx, sy, radius, color, rotate) {
  ctx.save()
  ctx.fillStyle = color
  ctx.translate(sx, sy) // 移动坐标原点
  ctx.rotate(Math.PI + rotate) // 旋转
  ctx.beginPath()

  let dig = (Math.PI / 5) * 4
  for (let i = 0; i < 5; i++) {
    // 画五角星的五条边
    let x = Math.sin(i * dig)
    let y = Math.cos(i * dig)
    ctx.lineTo(x * radius, y * radius)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
  ctx.restore()
}
</script>
<style lang="scss" scoped>
.label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
