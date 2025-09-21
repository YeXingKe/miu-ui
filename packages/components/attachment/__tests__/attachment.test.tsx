import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage, ElNotification } from 'element-plus'
import { MiuAttachment } from '@miu-ui/components/attachment'

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  },
  ElNotification: {
    info: vi.fn()
  }
}))

describe('MiuAttachment', () => {
  it('renders correctly', () => {
    const wrapper = mount(MiuAttachment)
    expect(wrapper.find('.attachment-uploader').exists()).toBe(true)
    expect(wrapper.find('.upload-area').exists()).toBe(true)
  })

  it('formats file size correctly', () => {
    const wrapper = mount(MiuAttachment)
    const vm = wrapper.vm as any

    expect(vm.formatSize(0)).toBe('0 B')
    expect(vm.formatSize(1024)).toBe('1 KB')
    expect(vm.formatSize(1048576)).toBe('1 MB')
  })

  it('handles file selection', async () => {
    const wrapper = mount(MiuAttachment)
    const vm = wrapper.vm as any

    // 创建模拟文件
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    // 模拟处理文件
    vm.processFiles([file])

    // 检查文件列表是否更新
    expect(vm.fileList.length).toBe(1)
    expect(vm.fileList[0].name).toBe('test.txt')
  })
})
