import { withInstall } from '@miu-ui/utils'
import Draggable from './src/draggable.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuDraggable: SFCWithInstall<typeof Draggable> = withInstall(Draggable)

export default MiuDraggable

export * from './src/draggable'
