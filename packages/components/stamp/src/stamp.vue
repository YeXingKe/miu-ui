<template>
  <div class="electronic-seal-container">
    <!-- 顶部标题 -->
    <div class="seal-header">
      <h2>电子印章生成器</h2>
      <p>自定义创建专业的电子印章</p>
    </div>
    <div class="seal-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <div class="config-section">
          <h3>印章内容</h3>
          <div class="config-el-item">
            <label>字体:</label>
            <el-select v-model="config.sealFont">
              <el-option v-for="(item, index) in sealFonts" :key="index" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </div>
          <div class="config-el-item">
            <label>单位名称:</label>
            <el-input v-model="config.companyName" placeholder="输入单位名称" />
          </div>
          <div class="config-el-item">
            <label>印章类型:</label>
            <el-select v-model="config.sealType">
              <el-option v-for="(item, index) in sealTypes" :key="index" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </div>
          <div class="config-el-item" v-if="config.sealType !== 'personal'">
            <label>底部文字:</label>
            <el-input v-model="config.bottomText" placeholder="如：专用章、编号等" />
          </div>
        </div>

        <div class="config-section">
          <h3>样式设置</h3>
          <div class="config-el-item" style="display: flex; align-items: center">
            <label style="margin-right: 5px">印章颜色:</label>
            <el-color-picker v-model="config.color" />
          </div>
          <div class="config-item">
            <label>印章尺寸:</label>
            <input type="range" v-model="config.size" min="100" max="400" />
            <span>{{ config.size }}px</span>
          </div>
          <div class="config-item">
            <label>字体大小:</label>
            <input type="range" v-model="config.fontSize" min="12" max="30" />
            <span>{{ config.fontSize }}px</span>
          </div>
          <div class="config-item">
            <label>圆线宽度:</label>
            <input type="range" v-model="config.lineWidth" min="2" max="5" />
            <span>{{ config.lineWidth }}px</span>
          </div>
          <div class="config-el-item">
            <label>字体布局:</label>
            <el-radio-group v-model="config.textLayout" style="margin-bottom: 30px">
              <el-radio-button value="semicircleText">半环形</el-radio-button>
              <el-radio-button value="circleText">环形</el-radio-button>
            </el-radio-group>
          </div>
          <div class="config-item">
            <label>边框样式:</label>
            <el-select v-model="config.borderStyle">
              <el-option value="single" label="单边框"></el-option>
              <el-option value="double" label="双边框"></el-option>
              <el-option value="dashed" label="虚线边框"></el-option>
            </el-select>
          </div>
        </div>

        <div class="config-section">
          <h3>中心图案</h3>
          <div class="config-el-item">
            <label>图案类型:</label>
            <el-select v-model="config.centerIcon">
              <el-option v-for="(item, index) in centerIcons" :key="index" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </div>
          <div class="config-el-item" v-if="config.centerIcon !== 'none'">
            <label>图案大小:</label>
            <input type="range" v-model="config.iconSize" min="10" max="50" />
            <span>{{ config.iconSize }}px</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button @click="generateSeal" type="primary">生成印章</el-button>
        </div>
      </div>

      <!-- 中间预览区域 -->
      <div class="preview-panel">
        <div class="preview-container">
          <canvas ref="canvasRef" :width="config.size" :height="config.size" class="seal-canvas"></canvas>
        </div>
        <div class="preview-controls">
          <el-tooltip effect="dark" content="撤销" placement="bottom">
            <el-button @click="undo" :disabled="historyIndex <= 0" type="info" circle>↩</el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="重做" placement="bottom">
            <el-button @click="redo" :disabled="historyIndex >= history.length - 1" type="info" circle>↪</el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="左旋转" placement="bottom">
            <el-button @click="rotateSeal(-15)" type="info" circle>↺</el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="右旋转" placement="bottom">
            <el-button @click="rotateSeal(15)" type="info" circle>↻</el-button>
          </el-tooltip>
          <select v-model="exportFormat" style="margin-left: 5px">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="svg">SVG</option>
          </select>
          <el-tooltip effect="dark" content="复制到剪贴板" placement="bottom">
            <el-button @click="copyToClipboard" :disabled="!sealDataUrl" :icon="CopyDocument" type="info" circle></el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 右侧模板选择 -->
      <div class="templates-panel">
        <h3>模板选择</h3>
        <div class="template-list">
          <div v-for="(template, index) in templates" :key="index" class="template-item" :class="{ active: currentTemplate === index }" @click="applyTemplate(template, index)">
            <div class="template-preview" :style="getTemplateStyle(template)"></div>
            <span>{{ template.name }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <!-- <el-button @click="generateSeal" type="primary">生成印章</el-button> -->
          <el-button @click="downloadSeal" :disabled="!sealDataUrl" type="info" style="margin-left: 0">下载印章</el-button>
          <el-button @click="resetConfig" type="danger" style="margin-left: 0">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreview" class="preview-modal" @click="showPreview = false">
      <div class="modal-content" @click.stop>
        <img :src="sealDataUrl" alt="印章预览" />
        <button @click="showPreview = false" class="btn-close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue'
import { Util } from '@miu-ui/utils'
import { ref, reactive, onMounted, watch } from 'vue'
import { defaultConfig, SealConfig, SealTemplate, templates, sealTypes, centerIcons, sealFonts } from './stamp'

defineOptions({
  name: 'MiuStamp'
})

// 响应式数据
const canvasRef = ref<HTMLCanvasElement | null>(null)
const sealDataUrl = ref('')
const showPreview = ref(false)
const exportFormat = ref('png')
const currentTemplate = ref(0)
const history = ref<SealConfig[]>([])
const historyIndex = ref(-1)
// const ctx = ref<CanvasRenderingContext2D | null>(null)

const config = reactive({ ...defaultConfig })

const rotateSeal = (degrees: number) => {
  config.rotation = (config.rotation + degrees) % 360
}

// 初始化
onMounted(() => {
  generateSeal()
  saveToHistory()
})

// 监听配置变化
watch(
  config,
  () => {
    generateSeal()
  },
  { deep: true }
)

// 生成印章
const generateSeal = () => {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const center = config.size / 2
  const radius = config.size / 2 - 10

  // 清空画布
  ctx.clearRect(0, 0, config.size, config.size)

  // 设置样式
  ctx.fillStyle = config.color // 设置填充颜色
  ctx.strokeStyle = config.color // 设置描边颜色
  ctx.lineWidth = config.lineWidth // 设置线条粗细
  ctx.textAlign = 'center' // 水平方向文字对齐：以给定 x 为中心
  ctx.textBaseline = 'middle' // 垂直方向文字对齐：以给定 y 为中心

  // 绘制边框
  drawBorder(ctx, center, radius)
  // 绘制中心图案
  drawCenterIcon(ctx, center)
  // 绘制文字
  drawText(ctx, center, radius)
  // 保存数据URL
  sealDataUrl.value = canvasRef.value.toDataURL(`image/${exportFormat.value}`)
}

// 绘制边框
const drawBorder = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, 2 * Math.PI)

  switch (config.borderStyle) {
    case 'double':
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(center, center, radius - 5, 0, 2 * Math.PI)
      ctx.stroke()
      break
    case 'dashed':
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      break
    default:
      ctx.stroke()
  }
}

// 绘制中心图案
const drawCenterIcon = (ctx: CanvasRenderingContext2D, center: number) => {
  if (config.centerIcon === 'none') return

  ctx.beginPath()

  switch (config.centerIcon) {
    case 'star':
      drawStar(ctx, center, center, config.iconSize, config.color, 0) // 绘画五角星
      break
    case 'pentagon':
      drawPentagon(ctx, center, center, config.iconSize, 5)
      break
    case 'circle':
      ctx.arc(center, center, config.iconSize / 2, 0, 2 * Math.PI)
      break
    case 'square':
      ctx.rect(center - config.iconSize / 2, center - config.iconSize / 2, config.iconSize, config.iconSize)
      break
  }

  ctx.fill()
}

// 绘制五角星
const drawStar = (ctx: CanvasRenderingContext2D, sx: number, sy: number, radius: number, color: string, rotate: number) => {
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

// 绘制五边形
const drawPentagon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, points: number) => {
  const rotate = (Math.PI / 2) * 3
  const step = Math.PI / points

  ctx.moveTo(cx, cy - radius)
  for (let i = 0; i <= points; i++) {
    const x = cx + Math.cos(rotate + i * step * 2) * radius
    const y = cy + Math.sin(rotate + i * step * 2) * radius
    ctx.lineTo(x, y)
  }
  ctx.closePath()
}

// 绘制文字
const drawText = (ctx: CanvasRenderingContext2D, center: number, radius: number) => {
  ctx.font = `bold ${config.fontSize}px "${config.sealFont}", sans-serif`

  // 绘制公司名称（圆形排列）
  if (config.companyName) {
    if (config.textLayout === 'circleText') {
      drawCircularText(ctx, config.companyName, center, center, radius - 20, 0, 2 * Math.PI)
    } else {
      drawSemiCircleText(ctx, config.companyName, center, center, radius - 20, Math.PI * 0.8, Math.PI * 2.2)
    }
  }

  // 绘制底部文字
  if (config.bottomText && config.sealType !== 'personal') {
    // 用“填充色”把文字内部填满，产生实心字
    // strokeText 用“描边色”给文字轮廓勾线，产生空心字。
    ctx.fillText(config.bottomText, center, center + radius / 2)
  }
}

// 绘制圆形排列的文字
const drawCircularText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const characters = text.split('') // 把字符串拆成单个字符数组
  const totalAngle = endAngle - startAngle // 计算整个弧段的总弧度。
  const anglePerChar = totalAngle / characters.length // 每个字符占用的弧度增量。

  ctx.save() // 保存当前画布状态，后面会多次变换坐标系。
  ctx.translate(x, y) // 把坐标系原点移到圆心 (x,y)
  ctx.rotate(startAngle) // 整体旋转坐标系，使第一个字符对准弧线的起始角度

  characters.forEach((char, index) => {
    ctx.save()
    ctx.rotate(anglePerChar * index)
    ctx.translate(0, -radius)
    ctx.rotate(Math.PI / 2) // 旋转90度,让字平行于x轴
    ctx.fillText(char, 0, 0) // 以当前坐标系原点为中心绘制字符。
    ctx.restore()
  })
  ctx.restore() // 恢复最初保存的画布状态
}

const drawSemiCircleText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const characters = text.split('')
  // 计算半圆的总弧度和每个字符的弧度
  const totalAngle = endAngle - startAngle
  const anglePerChar = totalAngle / (characters.length - 1) // 注意这里是 length-1

  ctx.save()
  ctx.translate(x, y)

  characters.forEach((char, index) => {
    ctx.save()
    // 计算当前字符的角度（在半圆上均匀分布）
    const angle = startAngle + anglePerChar * index
    // 计算字符位置
    const charX = Math.cos(angle) * radius
    const charY = Math.sin(angle) * radius
    // 移动到字符位置
    ctx.translate(charX, charY)
    // 旋转字符使其垂直于半径方向
    ctx.rotate(angle + Math.PI / 2)
    // 绘制字符
    ctx.fillText(char, 0, 0)

    ctx.restore()
  })

  ctx.restore()
}

// 下载印章
const downloadSeal = () => {
  if (!sealDataUrl.value) return

  const link = document.createElement('a')
  link.href = sealDataUrl.value
  link.download = `电子印章_${new Date().getTime()}.${exportFormat.value}`
  link.click()
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const blob = await fetch(sealDataUrl.value).then(r => r.blob())
    // 先检测再使用
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    } else {
      // 降级方案：提示用户手动复制、使用 execCommand('copy')、
      // 或引导用户升级/切换浏览器
      console.log('您的浏览器不支持快速复制，请手动操作')
    }
    console.log('已复制到剪贴板')
  } catch (err) {
    console.error('copy error:', err)
  }
}

// 历史记录功能
const saveToHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push({ ...config })
  historyIndex.value = history.value.length - 1
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    Object.assign(config, history.value[historyIndex.value])
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    Object.assign(config, history.value[historyIndex.value])
  }
}

// 模板应用
const applyTemplate = (template: SealTemplate, index: number) => {
  currentTemplate.value = index
  Object.assign(config, { ...defaultConfig, ...template.config })
  saveToHistory()
}

// 重置配置
const resetConfig = () => {
  Object.assign(config, defaultConfig)
  saveToHistory()
}

// 获取模板样式
const getTemplateStyle = (template: SealTemplate) => {
  return {
    backgroundColor: template.config.color || '#e74c3c',
    borderColor: template.config.color || '#e74c3c'
  }
}

const emits = defineEmits(['confirm'])
const confirm = () => {
  // drawSemiCircleText(ctx)
  const baseFile = canvasRef.value && canvasRef.value.toDataURL() // 默认转成png格式的图片编码，这是base-64格式图片
  const fileName = Date.now() // 用时间戳做文件名
  const file = Util.dataURLtoFile(baseFile, fileName + '') // 图片文件信息，传给后端存储
  emits('confirm', { fileInfo: file, imageData: baseFile }) // 暴露出去的信息
}
</script>
