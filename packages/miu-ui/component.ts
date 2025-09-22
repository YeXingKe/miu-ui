import type { Plugin } from 'vue'

import { MiuChooseCity } from '@miu-ui/components/choose-city'
import { MiuNation } from '@miu-ui/components/nation'
import { MiuSelect } from '@miu-ui/components/select'
import { MiuStamp } from '@miu-ui/components/stamp'
import { MiuSignture } from '@miu-ui/components/signature'
import { MiuAttachment } from '@miu-ui/components/attachment'

export default [MiuChooseCity, MiuNation, MiuSelect, MiuStamp, MiuSignture, MiuAttachment] as Plugin[]
