import { withInstall } from '@miu-ui/utils'
import Attachment from './src/attachment.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuAttachment: SFCWithInstall<typeof Attachment> = withInstall(Attachment)

export default MiuAttachment

export * from './src/attachment'
// export * from './src/useChunkUpload'
// export * from './src/useChunkUpload'
