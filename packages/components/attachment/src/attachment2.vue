<template>
  <div class="attachment-uploader">
    <h2>高级附件上传</h2>

    <div class="upload-area" :class="{ dragover: isDragover }" @drop.prevent="handleDrop" @dragover.prevent="isDragover = true" @dragleave.prevent="isDragover = false">
      <el-icon :size="50" color="#409eff"><UploadFilled /></el-icon>
      <p>将文件拖到此处，或<el-button type="primary" link @click="triggerUpload">点击上传</el-button></p>
      <p class="text-hint">支持大文件上传、断点续传、文件夹上传</p>
    </div>

    <el-button @click="handleFolderUpload" :icon="Folder">上传文件夹</el-button>

    <el-divider />

    <div class="file-list">
      <div v-for="file in fileList" :key="file.id" class="file-item">
        <el-icon :size="24"><Document /></el-icon>
        <div class="file-info">
          <div>{{ file.name }}</div>
          <div class="progress-container" v-if="file.status === FileUploadStatus.UPLOADING">
            <el-progress :percentage="file.progress" :status="file.errorMessage ? 'exception' : ''" :stroke-width="16" />
            <div v-if="file.status === FileUploadStatus.UPLOADING" style="font-size: 12px; margin-top: 4px">速度: {{ formatSpeed(file.speed) }} | 剩余: {{ formatTime(file.remainingTime) }}</div>
            <div class="chips-container" v-if="file.chunks.length > 0">
              <span class="chip" v-for="chunk in file.chunks" :key="chunk.id"> 分片{{ chunk.index }}: {{ chunk.progress }}% </span>
            </div>
          </div>
          <div v-if="file.errorMessage" style="color: #f56c6c; font-size: 12px">
            {{ file.errorMessage }}
          </div>
        </div>
        <div class="file-actions">
          <el-button v-if="file.status === FileUploadStatus.PAUSED || file.status === FileUploadStatus.ERROR" @click="resumeUpload(file)" :icon="VideoPlay" size="small" circle />
          <el-button v-if="file.status === FileUploadStatus.UPLOADING" @click="pauseUpload(file)" :icon="VideoPause" size="small" circle />
          <el-button @click="cancelUpload(file)" :icon="Close" size="small" circle />
          <el-button v-if="file.status === FileUploadStatus.SUCCESS" @click="handlePreview(file)" :icon="View" size="small" circle />
        </div>
      </div>
    </div>

    <input type="file" ref="fileInput" @change="handleFileChange" :multiple="true" style="display: none" />
    <input type="file" ref="folderInput" @change="handleFolderChange" :webkitdirectory="true" :multiple="true" style="display: none" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElNotification, ElIcon, ElButton, ElProgress, ElDivider } from 'element-plus'
import { UploadFilled, Document, VideoPlay, VideoPause, Close, View, Folder } from '@element-plus/icons-vue'

defineOptions({
  name: 'MiuAttachment'
})

// 类型定义
enum FileUploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

enum ChunkStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface UploadFile {
  id: string
  rawFile: File
  name: string
  size: number
  type: string
  status: FileUploadStatus
  progress: number
  chunks: FileChunk[]
  errorMessage: string
  uploadedSize: number
  speed: number
  remainingTime: number
}

interface FileChunk {
  id: string
  index: number
  file: UploadFile
  start: number
  end: number
  size: number
  status: ChunkStatus
  progress: number
  retryCount: number
}

interface UploadManager {
  chunkSize: number
  maxParallelUploads: number
  maxRetries: number
  currentUploads: number
  uploadQueue: UploadFile[]
}

// 组件实现
const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const fileList = ref<UploadFile[]>([])
const uploadManager = reactive<UploadManager>({
  chunkSize: 5 * 1024 * 1024, // 5MB分片
  maxParallelUploads: 3,
  maxRetries: 3,
  currentUploads: 0,
  uploadQueue: []
})

// 工具函数
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  return formatSize(bytesPerSecond) + '/s'
}

const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0秒'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// 触发文件选择
const triggerUpload = (): void => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (files.length > 0) {
    processFiles(files)
  }
  target.value = '' // 重置input
}

// 处理文件夹上传
const handleFolderUpload = (): void => {
  folderInput.value?.click()
}

const handleFolderChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (files.length > 0) {
    ElNotification({
      title: '文件夹上传',
      message: `检测到 ${files.length} 个文件`,
      type: 'info'
    })
    processFiles(files)
  }
  target.value = '' // 重置input
}

// 处理拖放文件
const handleDrop = (e: DragEvent): void => {
  isDragover.value = false
  const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
  if (files.length > 0) {
    // 检查是否有文件夹
    const items = e.dataTransfer?.items ? Array.from(e.dataTransfer.items) : []
    const hasDirectory = items.some(item => {
      const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
      return entry && entry.isDirectory
    })

    if (hasDirectory) {
      ElMessage.warning('请使用"上传文件夹"功能上传文件夹')
    } else {
      processFiles(files)
    }
  }
}

// 处理文件列表
const processFiles = (files: File[]): void => {
  files.forEach(file => {
    const uploadFile: UploadFile = {
      id: generateId(),
      rawFile: file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: FileUploadStatus.PENDING,
      progress: 0,
      chunks: [],
      errorMessage: '',
      uploadedSize: 0,
      speed: 0,
      remainingTime: 0
    }

    fileList.value.push(uploadFile)

    // 大文件分片处理
    if (file.size > uploadManager.chunkSize) {
      createFileChunks(uploadFile)
    }

    // 添加到上传队列
    uploadManager.uploadQueue.push(uploadFile)
  })

  // 开始处理上传队列
  processUploadQueue()
}

// 创建文件分片
const createFileChunks = (uploadFile: UploadFile): void => {
  const file = uploadFile.rawFile
  const chunkSize = uploadManager.chunkSize
  const chunks: FileChunk[] = []
  let start = 0
  let index = 0

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    chunks.push({
      id: generateId(),
      index,
      file: uploadFile,
      start,
      end,
      size: end - start,
      status: ChunkStatus.PENDING,
      progress: 0,
      retryCount: 0
    })
    start = end
    index++
  }

  uploadFile.chunks = chunks
}

// 处理上传队列
const processUploadQueue = (): void => {
  // 并行上传控制
  while (uploadManager.currentUploads < uploadManager.maxParallelUploads && uploadManager.uploadQueue.length > 0) {
    const file = uploadManager.uploadQueue.shift()
    if (file) {
      uploadManager.currentUploads++
      startUpload(file)
    }
  }
}

// 开始上传文件
const startUpload = async (file: UploadFile): Promise<void> => {
  file.status = FileUploadStatus.UPLOADING

  try {
    // 大文件使用分片上传
    if (file.chunks.length > 0) {
      await uploadChunkedFile(file)
    } else {
      await uploadWholeFile(file)
    }

    file.status = FileUploadStatus.SUCCESS
    file.progress = 100
    ElMessage.success(`文件 ${file.name} 上传成功`)
  } catch (error) {
    file.status = FileUploadStatus.ERROR
    file.errorMessage = (error as Error).message || '上传失败'
    ElMessage.error(`文件 ${file.name} 上传失败: ${(error as Error).message}`)
  } finally {
    uploadManager.currentUploads--
    processUploadQueue()
  }
}

// 上传完整文件（小文件）
const uploadWholeFile = (file: UploadFile): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 模拟上传过程
    const totalSize = file.size
    let uploaded = 0
    const interval = setInterval(() => {
      if (file.status !== FileUploadStatus.UPLOADING) {
        clearInterval(interval)
        return
      }

      uploaded += 1024 * 1024 // 模拟每秒1MB
      if (uploaded >= totalSize) {
        file.progress = 100
        file.uploadedSize = totalSize
        clearInterval(interval)
        resolve()
      } else {
        file.progress = Math.round((uploaded / totalSize) * 100)
        file.uploadedSize = uploaded
        file.speed = 1024 * 1024 // 1MB/s
        file.remainingTime = Math.ceil((totalSize - uploaded) / file.speed)
      }
    }, 1000)
  })
}

// 分片上传文件
const uploadChunkedFile = async (file: UploadFile): Promise<void> => {
  for (const chunk of file.chunks) {
    if (chunk.status === ChunkStatus.SUCCESS) continue

    chunk.status = ChunkStatus.UPLOADING
    let retry = 0

    while (retry <= uploadManager.maxRetries) {
      try {
        // 模拟分片上传
        await uploadChunk(chunk, file)
        chunk.status = ChunkStatus.SUCCESS
        chunk.progress = 100
        break
      } catch (error) {
        retry++
        chunk.retryCount = retry

        if (retry > uploadManager.maxRetries) {
          chunk.status = ChunkStatus.ERROR
          throw new Error(`分片 ${chunk.index} 上传失败: ${(error as Error).message}`)
        }

        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * retry))
      }
    }

    // 更新文件总进度
    updateFileProgress(file)
  }
}

// 上传单个分片
const uploadChunk = (chunk: FileChunk, file: UploadFile): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 模拟分片上传
    let uploaded = 0
    const totalSize = chunk.size
    const interval = setInterval(() => {
      if (file.status !== FileUploadStatus.UPLOADING) {
        clearInterval(interval)
        reject(new Error('上传已暂停'))
        return
      }

      uploaded += 256 * 1024 // 模拟每秒256KB
      if (uploaded >= totalSize) {
        chunk.progress = 100
        clearInterval(interval)
        resolve()
      } else {
        chunk.progress = Math.round((uploaded / totalSize) * 100)
      }
    }, 1000)
  })
}

// 更新文件总进度
const updateFileProgress = (file: UploadFile): void => {
  const totalChunks = file.chunks.length
  const completedChunks = file.chunks.filter(chunk => chunk.status === ChunkStatus.SUCCESS).length

  file.progress = Math.round((completedChunks / totalChunks) * 100)
}

// 暂停上传
const pauseUpload = (file: UploadFile): void => {
  file.status = FileUploadStatus.PAUSED
  ElMessage.info(`已暂停上传: ${file.name}`)
}

// 继续上传
const resumeUpload = (file: UploadFile): void => {
  file.status = FileUploadStatus.UPLOADING
  uploadManager.uploadQueue.push(file)
  processUploadQueue()
  ElMessage.info(`继续上传: ${file.name}`)
}

// 取消上传
const cancelUpload = (file: UploadFile): void => {
  file.status = FileUploadStatus.CANCELLED
  ElMessage.info(`已取消上传: ${file.name}`)

  // 从队列中移除
  const index = uploadManager.uploadQueue.indexOf(file)
  if (index > -1) {
    uploadManager.uploadQueue.splice(index, 1)
  }

  // 从文件列表中移除
  setTimeout(() => {
    const fileIndex = fileList.value.indexOf(file)
    if (fileIndex > -1) {
      fileList.value.splice(fileIndex, 1)
    }
  }, 500)
}

// 预览文件
const handlePreview = (file: UploadFile): void => {
  // 根据文件类型执行不同的预览操作
  if (file.type.startsWith('image/')) {
    // 图片预览逻辑
    ElNotification({
      title: '图片预览',
      message: `预览图片: ${file.name}`,
      type: 'info'
    })
  } else {
    // 其他文件类型
    ElNotification({
      title: '文件预览',
      message: `不支持在线预览: ${file.name}`,
      type: 'warning'
    })
  }
}
</script>

<style scoped>
.attachment-uploader {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;
  transition: border-color 0.3s;
  background-color: #f5f7fa;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #409eff;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;
}

.file-item:hover {
  background-color: #ebf5ff;
}

.file-info {
  flex: 1;
  margin-left: 12px;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.progress-container {
  margin-top: 8px;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.chip {
  padding: 2px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.text-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style>
