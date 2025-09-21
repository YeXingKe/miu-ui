import { UploadRawFile, UploadUserFile } from 'element-plus'

// types/upload.ts
export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
  file?: File
}

export interface UploadProps {
  concurrent: number // 3 并发数
  multiple?: boolean
  accept?: string
  maxSize?: number // MB
  maxCount?: number
  chunkSize?: number // MB
  autoUpload?: boolean
  disabled?: boolean
  fileList?: UploadFile[]
}

export interface UploadEmits {
  (e: 'update:fileList', files: UploadFile[]): void
  (e: 'change', files: UploadFile[]): void
  (e: 'success', file: UploadFile, response: any): void
  (e: 'error', file: UploadFile, error: Error): void
  (e: 'progress', file: UploadFile, progress: number): void
  (e: 'remove', file: UploadFile): void
}
// types/chunk.ts
export interface Chunk {
  index: number
  start: number
  end: number
  hash: string
  file: Blob
}

export interface UploadChunkResponse {
  chunkIndex: number
  uploaded: boolean
  url?: string
}

export const getStatusType = (status?: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'uploading':
      return 'primary'
    case 'fail':
      return 'danger'
    default:
      return 'info'
  }
}

export const getStatusText = (status?: string) => {
  switch (status) {
    case 'ready':
      return '等待上传'
    case 'uploading':
      return '上传中'
    case 'success':
      return '上传成功'
    case 'fail':
      return '上传失败'
    default:
      return '未知状态'
  }
}

export const getProgressStatus = (status?: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'fail':
      return 'exception'
    default:
      return undefined
  }
}

// 类型定义
export interface AttachmentFile extends UploadUserFile {
  uid: string
  name: string
  size: number
  status: 'ready' | 'uploading' | 'success' | 'fail'
  percentage?: number
  raw?: UploadRawFile
  uploadTime?: number
  url?: string
}

export interface AttachmentProps {
  // 上传地址
  action?: string
  // 是否自动上传
  autoUpload?: boolean
  // 文件数量限制
  limit?: number
  // 文件大小限制（字节）
  maxSize?: number
  // 接受的文件类型
  accept?: string
  // 是否支持拖拽上传
  drag?: boolean
  // 是否显示选择列
  showSelection?: boolean
  // 是否显示进度条
  showProgress?: boolean
  // 空数据提示文本
  emptyText?: string
  // 初始文件列表
  initialFiles?: AttachmentFile[]
  // 是否启用自定义上传（用于断点续传等高级功能）
  customUpload?: boolean
}
