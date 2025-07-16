import { withInstall } from '@miu-ui/utils'
import ChooseCity from './src/index.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuChooseCity: SFCWithInstall<typeof ChooseCity> = withInstall(ChooseCity)

export default MiuChooseCity

// export * from './src'
// export * from './src/constants'
// export type { ButtonInstance, ButtonGroupInstance } from './src/instance'
