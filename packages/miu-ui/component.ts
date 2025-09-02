import type { Plugin } from 'vue'

import { MiuChooseCity } from '@miu-ui/components/choose-city'
import { MiuNation } from '@miu-ui/components/nation'
import { MiuSelect } from '@miu-ui/components/select'
import { MiuStamp } from '@miu-ui/components/stamp'
import { MiuSignture } from '@miu-ui/components/signature'

export default [MiuChooseCity, MiuNation, MiuSelect, MiuStamp, MiuSignture] as Plugin[]
