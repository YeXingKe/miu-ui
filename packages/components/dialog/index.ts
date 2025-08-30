import { withInstall } from '@miu-ui/utils'
import Dialog from './src/dialog.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuDialog: SFCWithInstall<typeof Dialog> = withInstall(Dialog)

export default MiuDialog