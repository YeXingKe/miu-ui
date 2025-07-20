import { withInstall } from '@miu-ui/utils'
import Nation from './src/nation.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuNation: SFCWithInstall<typeof Nation> = withInstall(Nation)

export default MiuNation
export * from './src/nation'
