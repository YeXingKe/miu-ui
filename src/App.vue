<template>
  <div>
    <MiuAttachment action="/api/upload" :max-size="50 * 1024 * 1024" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" :auto-upload="false" @upload-success="handleUploadSuccess" />
  </div>
</template>

<script setup lang="ts">
import { MiuAttachment } from '@miu-ui/components'

const handleUploadSuccess = (file, fileList) => {
  console.log('文件上传成功', file)
}
</script>
