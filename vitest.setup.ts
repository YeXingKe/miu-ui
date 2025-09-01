import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import ResizeObserver from 'resize-observer-polyfill'

// vi.doMock('*.css', () => ({}));
vi.mock('*.css', () => ({}));
// 提供对 ResizeObserver API 的兼容支持,
//  使用 resize-observer-polyfill 模拟 ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserver)
config.global.stubs = {} // 清除任何全局注册的组件存根（Stubs）

