<template>
  <div class="attachment-container">
    <!-- 上传区域 -->
    <div class="upload-section">
      <el-upload
        ref="uploadRef"
        :action="uploadAction"
        :multiple="true"
        :file-list="fileList"
        :auto-upload="autoUpload"
        :limit="limit"
        :on-exceed="handleExceed"
        :on-change="handleFileChange"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-progress="handleProgress"
        :before-upload="beforeUpload"
        :http-request="customRequest"
        :drag="drag"
        :show-file-list="false"
        class="upload-area"
      >
        <template #trigger>
          <!-- <el-button type="primary" :icon="Upload">选择文件</el-button> -->
          <el-icon :size="50" color="#409eff"><UploadFilled /></el-icon>
          <p>将文件拖到此处，或<el-button type="primary" link>点击上传</el-button></p>
          <p class="text-hint">支持大文件上传、断点续传、文件夹上传</p>
        </template>

        <template #tip>
          <div class="upload-tip">支持{{ accept }}格式文件，单个文件不超过{{ formatFileSize(maxSize) }}</div>
        </template>
      </el-upload>

      <!-- <el-button v-if="!autoUpload" class="upload-demo" type="success" :icon="UploadFilled" @click="submitUpload"> 开始上传 </el-button>

      <el-button v-if="showCancel" class="upload-demo" type="danger" :icon="Close" @click="cancelUpload"> 取消上传 </el-button> -->
    </div>

    <!-- 文件列表区域 -->
    <!-- <div class="file-list-section"> -->
    <el-table :data="fileList" style="width: 100%" row-key="uid" v-loading="loading" :empty-text="emptyText" @selection-change="handleSelectionChange" @sort-change="handleSortChange" stripe border>
      <!-- 选择列 -->
      <el-table-column v-if="showSelection" type="selection" width="55" />

      <!-- 文件名列 -->
      <el-table-column label="文件名" min-width="200" sortable="custom">
        <template #default="{ row }">
          <div class="file-name-cell">
            <el-icon class="file-icon">
              <component :is="getFileIcon(row.name)" />
            </el-icon>
            <span class="file-name" :title="row.name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 大小列 -->
      <el-table-column prop="size" label="大小" width="120" sortable="custom">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>

      <!-- 状态列 -->
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 进度列 -->
      <el-table-column label="进度" width="180" v-if="showProgress">
        <template #default="{ row }">
          <el-progress :percentage="row.percentage || 0" :status="getProgressStatus(row.status)" :stroke-width="16" :text-inside="true" />
        </template>
      </el-table-column>

      <!-- 上传时间列 -->
      <el-table-column prop="uploadTime" label="上传时间" width="160" sortable="custom">
        <template #default="{ row }">
          {{ formatTime(row.uploadTime) }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-tooltip effect="dark" content="下载" placement="bottom" v-if="row.status === 'success'">
            <el-icon :size="22" @click="handleDownload(row)" class="icon">
              <Download />
            </el-icon>
          </el-tooltip>
          <el-tooltip effect="dark" content="预览" placement="bottom" v-if="isPreviewable(row.name) && row.status === 'success'">
            <el-icon color="red" :size="22" @click="handlePreview(row)" class="icon">
              <View />
            </el-icon>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="bottom" v-if="row.status !== 'uploading'">
            <el-icon color="red" :size="22" @click="handleRemove(row)" class="icon">
              <Delete />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- </div> -->

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" :title="previewTitle" width="80%">
      <div class="preview-content">
        <img v-if="previewImage" :src="previewImage" class="preview-image" />
        <div v-else class="preview-unavailable">该文件类型不支持预览</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ElUpload,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElProgress,
  ElDialog,
  ElMessage,
  ElMessageBox,
  type UploadFile,
  type UploadFiles,
  type UploadUserFile,
  type UploadRawFile,
  type UploadProgressEvent,
  type UploadRequestHandler,
  type UploadRequestOptions
} from 'element-plus'
import { Upload, Close, Download, View, Delete, Document, Picture, VideoCamera, Headset, UploadFilled } from '@element-plus/icons-vue'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { getStatusType, getStatusText, getProgressStatus, AttachmentFile, AttachmentProps } from './attachment'

defineOptions({
  name: 'MiuAttachment'
})

// 属性定义
const props = withDefaults(defineProps<AttachmentProps>(), {
  action: '/api/upload',
  autoUpload: true,
  limit: 10,
  maxSize: 100 * 1024 * 1024, // 100MB
  accept: '*',
  drag: true,
  showSelection: true,
  showProgress: true,
  emptyText: '暂无文件',
  initialFiles: () => [],
  customUpload: false
})

// 事件定义
const emit = defineEmits<{
  (e: 'upload-success', file: AttachmentFile, fileList: AttachmentFile[]): void
  (e: 'upload-error', error: Error, file: AttachmentFile, fileList: AttachmentFile[]): void
  (e: 'upload-progress', event: UploadProgressEvent, file: AttachmentFile, fileList: AttachmentFile[]): void
  (e: 'file-remove', file: AttachmentFile, fileList: AttachmentFile[]): void
  (e: 'file-download', file: AttachmentFile): void
  (e: 'file-preview', file: AttachmentFile): void
  (e: 'selection-change', selection: AttachmentFile[]): void
  (e: 'sort-change', column: TableColumnCtx<AttachmentFile>, order: string): void
}>()

// 引用和状态
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null)
const fileList = ref<AttachmentFile[]>([])
const loading = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
const selectedFiles = ref<AttachmentFile[]>([])
const showCancel = ref(false)

// 计算属性
const uploadAction = computed(() => {
  return props.customUpload ? '' : props.action
})

// 生命周期
onMounted(() => {
  if (props.initialFiles && props.initialFiles.length > 0) {
    fileList.value = props.initialFiles.map(file => ({
      ...file,
      status: file.status || 'success',
      percentage: file.percentage || 100
    }))
  }
})

// 方法
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return Picture
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
    return VideoCamera
  } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
    return Headset
  }

  return Document
}

const isPreviewable = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'].includes(extension)
}

const formatFileSize = (size: number): string => {
  if (size === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))

  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '-'

  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  fileList.value = files as unknown as AttachmentFile[]

  // 检查文件大小
  if (file.raw && file.raw.size > props.maxSize) {
    ElMessage.error(`文件 ${file.name} 超过大小限制`)
    handleRemove(file)
    return false
  }
}

const beforeUpload = (rawFile: UploadRawFile) => {
  // 文件类型检查
  if (props.accept !== '*' && props.accept !== '') {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const fileExtension = '.' + rawFile.name.split('.').pop()?.toLowerCase()

    if (!acceptTypes.some(type => type.toLowerCase().endsWith(fileExtension))) {
      ElMessage.error(`文件格式不支持，请上传 ${props.accept} 格式的文件`)
      return false
    }
  }

  // 文件大小检查
  if (rawFile.size > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${formatFileSize(props.maxSize)}`)
    return false
  }

  return true
}

const handleSuccess = (response: any, file: UploadFile, files: UploadFiles) => {
  const attachmentFile = file as unknown as AttachmentFile
  attachmentFile.status = 'success'
  attachmentFile.percentage = 100
  attachmentFile.uploadTime = Date.now()

  if (response && response.url) {
    attachmentFile.url = response.url
  }

  ElMessage.success(`文件 ${file.name} 上传成功`)
  emit('upload-success', attachmentFile, files as unknown as AttachmentFile[])
}

const handleError = (error: Error, file: UploadFile, files: UploadFiles) => {
  const attachmentFile = file as unknown as AttachmentFile
  attachmentFile.status = 'fail'

  ElMessage.error(`文件 ${file.name} 上传失败: ${error.message}`)
  emit('upload-error', error, attachmentFile, files as unknown as AttachmentFile[])
}

const handleProgress = (event: UploadProgressEvent, file: UploadFile, files: UploadFiles) => {
  const attachmentFile = file as unknown as AttachmentFile
  attachmentFile.percentage = event.percent
  showCancel.value = true

  emit('upload-progress', event, attachmentFile, files as unknown as AttachmentFile[])
}

const handleExceed = (files: FileList) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

const handleRemove = async (file: AttachmentFile) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 ${file.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
      emit('file-remove', file, fileList.value)
      ElMessage.success('文件删除成功')
    }
  } catch (error) {
    // 用户取消了删除操作
  }
}

const handleDownload = (file: AttachmentFile) => {
  if (!file.url) {
    ElMessage.error('文件下载地址不存在')
    return
  }

  // 创建隐藏的下载链接
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  emit('file-download', file)
}

const handlePreview = (file: AttachmentFile) => {
  if (!file.url) {
    ElMessage.error('文件预览地址不存在')
    return
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || ''

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    previewImage.value = file.url
    previewTitle.value = `图片预览 - ${file.name}`
    previewVisible.value = true
    emit('file-preview', file)
  } else if (extension === 'pdf') {
    window.open(file.url, '_blank')
    emit('file-preview', file)
  } else {
    ElMessage.info('该文件类型不支持预览')
  }
}

const handleSelectionChange = (selection: AttachmentFile[]) => {
  selectedFiles.value = selection
  emit('selection-change', selection)
}

const handleSortChange = (column: TableColumnCtx<AttachmentFile>, order: string) => {
  emit('sort-change', column, order)
}

const submitUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.submit()
  }
}

const cancelUpload = () => {
  if (uploadRef.value) {
    // 取消所有正在上传的文件
    fileList.value.forEach(file => {
      if (file.status === 'uploading') {
        file.status = 'fail'
        file.percentage = 0
      }
    })

    showCancel.value = false
    ElMessage.info('已取消上传')
  }
}

// 自定义上传请求（用于实现断点续传等高级功能）
const customRequest: UploadRequestHandler = async (options: UploadRequestOptions) => {
  const { file, onProgress, onSuccess, onError } = options

  try {
    // 这里可以实现分片上传和断点续传逻辑
    // 示例代码仅做简单演示

    // 模拟上传进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      onProgress({ percent: progress } as UploadProgressEvent)

      if (progress >= 100) {
        clearInterval(interval)
        onSuccess({ url: URL.createObjectURL(file) })
      }
    }, 200)
  } catch (error) {
    onError(error as Error)
  }
}

// 暴露方法供父组件调用
defineExpose({
  submitUpload,
  cancelUpload,
  clearFiles: () => {
    fileList.value = []
  },
  getSelectedFiles: () => selectedFiles.value
})
</script>
