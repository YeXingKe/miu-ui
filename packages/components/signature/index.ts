import { withInstall } from '@miu-ui/utils'
import type { SFCWithInstall } from '@miu-ui/utils'
import Signture from './src/signture.vue'

export const MiuSignture: SFCWithInstall<typeof Signture> = withInstall(Signture)

export default MiuSignture