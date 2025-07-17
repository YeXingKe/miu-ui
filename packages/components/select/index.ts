import { withInstall } from '@miu-ui/utils'
import Select from './src/select.vue'
import type { SFCWithInstall } from '@miu-ui/utils'

export const MiuSelect: SFCWithInstall<typeof Select> = withInstall(Select)

export default MiuSelect
