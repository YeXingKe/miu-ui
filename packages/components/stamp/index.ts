import { withInstall } from '@miu-ui/utils'
import type { SFCWithInstall } from '@miu-ui/utils'
import Stamp from './src/stamp.vue'

export const MiuStamp: SFCWithInstall<typeof Stamp> = withInstall(Stamp)

export default MiuStamp