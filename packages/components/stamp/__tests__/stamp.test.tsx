import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { MiuStamp } from '@miu-ui/components'

// Canvas 绘制测试：验证各种绘制方法是否正确调用
// 配置更新测试：确保响应式配置正确工作
// 用户交互测试：测试按钮点击、选择框变化等交互
// 历史记录测试：验证撤销/重做功能
// 导出功能测试：测试下载和复制到剪贴板
// 错误处理测试：验证异常情况的处理
// 组件生命周期测试：确保资源正确清理
// 模拟 DOMRect

class MockDOMRect implements DOMRect {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0,
    public left: number = 0,
    public top: number = 0,
    public right: number = 0,
    public bottom: number = 0
  ) {}

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      left: this.left,
      top: this.top,
      right: this.right,
      bottom: this.bottom
    }
  }
}

// 模拟 CanvasRenderingContext2D
const createMockContext = () => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  setLineDash: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  rect: vi.fn(),
  lineWidth: 2,
  strokeStyle: '#000000',
  fillStyle: '#000000',
  textAlign: 'center',
  textBaseline: 'middle',
  font: '16px sans-serif'
})

// 模拟 Clipboard API
const mockClipboard = {
  write: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true
})

describe('MiuStamp', () => {
  let wrapper: VueWrapper<any>
  let mockContext: ReturnType<typeof createMockContext>
  let mockGetBoundingClientRect

  beforeEach(() => {
    // 创建模拟上下文
    mockContext = createMockContext()

    // 创建模拟 DOMRect
    const mockRect = new MockDOMRect(0, 0, 200, 200)

    // 模拟 getBoundingClientRect
    mockGetBoundingClientRect = vi.fn(() => mockRect)
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(mockGetBoundingClientRect)

    // 模拟 Canvas 方法
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock-data')

    // 挂载组件
    wrapper = mount(MiuStamp, {
      attachTo: document.body
    })

    wrapper.vm.ctx = mockContext
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('stamp component rendered', () => {
    expect(wrapper.find('.electronic-seal-container').exists()).toBe(true)
    expect(wrapper.find('.config-panel').exists()).toBe(true)
    expect(wrapper.find('.preview-panel').exists()).toBe(true)
    expect(wrapper.find('.templates-panel').exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  test('correct initialization setup', () => {
    expect(wrapper.vm.config.companyName).toBe('示例科技有限公司')
    expect(wrapper.vm.config.sealType).toBe('company')
    expect(wrapper.vm.config.color).toBe('#e74c3c')
    expect(wrapper.vm.config.size).toBe(200)
  })

  // Canvas 上下文初始化正确
  test('correct init context', () => {
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
    expect(wrapper.vm.ctx).toBeDefined()
  })

  // 生成印章
  test('generateSeal test', async () => {
    await wrapper.vm.generateSeal()

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 200, 200)
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.arc).toHaveBeenCalled()
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled()
    expect(wrapper.vm.sealDataUrl).toBe('data:image/png;base64,mock-data')
  })

  // 绘制边框样式 - 单边框
  test('draw border style - single test', async () => {
    wrapper.vm.config.borderStyle = 'single'
    await wrapper.vm.drawBorder(mockContext, 100, 90)

    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 90, 0, 2 * Math.PI)
    expect(mockContext.stroke).toHaveBeenCalled()
    expect(mockContext.setLineDash).not.toHaveBeenCalled()
  })

  // 绘制中心图案 - 五角星
  test('draw center icon - star test', async () => {
    wrapper.vm.config.centerIcon = 'star'
    await wrapper.vm.drawCenterIcon(mockContext, 100)

    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.closePath).toHaveBeenCalled()
    expect(mockContext.fill).toHaveBeenCalled()
  })

  // 绘制圆形文字
  test('draw circle text test', async () => {
    const text = '测试文字'
    await wrapper.vm.drawCircularText(mockContext, text, 100, 100, 80, 0, Math.PI)

    expect(mockContext.save).toHaveBeenCalled()
    expect(mockContext.translate).toHaveBeenCalledWith(100, 100)
    expect(mockContext.rotate).toHaveBeenCalled()
    expect(mockContext.fillText).toHaveBeenCalled()
    expect(mockContext.restore).toHaveBeenCalled()
  })

  //   test('旋转印章功能', async () => {
  //     const initialRotation = wrapper.vm.config.rotation
  //     await wrapper.vm.rotateSeal(15)

  //     expect(wrapper.vm.config.rotation).toBe(initialRotation + 15)

  //     await wrapper.vm.rotateSeal(-30)
  //     expect(wrapper.vm.config.rotation).toBe((initialRotation + 15 - 30) % 360)
  //   })

  test('download seal test', async () => {
    // 模拟 createElement 和 click 方法
    const mockClick = vi.fn()
    const originalCreateElement = document.createElement
    document.createElement = vi.fn(
      () =>
        ({
          href: '',
          download: '',
          click: mockClick
        }) as any
    )

    wrapper.vm.sealDataUrl = 'data:image/png;base64,test-data'
    await wrapper.vm.downloadSeal()

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockClick).toHaveBeenCalled()

    // 恢复原始方法
    document.createElement = originalCreateElement
  })

  test('copy success test', async () => {
    wrapper.vm.sealDataUrl = 'data:image/png;base64,test-data'

    // 模拟 fetch
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob())
    })

    await wrapper.vm.copyToClipboard()

    expect(global.fetch).toHaveBeenCalledWith('data:image/png;base64,test-data')
    // expect(navigator.clipboard.write).toHaveBeenCalled()
  })

  //   test('copy error test', async () => {
  //     wrapper.vm.sealDataUrl = 'data:image/png;base64,test-data'

  //     // 模拟 fetch 失败
  //     global.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'))

  //     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  //     await wrapper.vm.copyToClipboard()

  //     expect(consoleSpy).toHaveBeenCalledWith('copy error:', expect.any(Error))
  //     consoleSpy.mockRestore()
  //   })
  // 历史记录测试
  test('history record test', async () => {
    const initialConfig = { ...wrapper.vm.config }

    // 修改配置并保存历史
    wrapper.vm.config.companyName = '新公司名称'
    await wrapper.vm.saveToHistory()

    expect(wrapper.vm.history.length).toBe(2)
    expect(wrapper.vm.historyIndex).toBe(1)

    // 测试撤销
    await wrapper.vm.undo()
    expect(wrapper.vm.config.companyName).toBe(initialConfig.companyName)
    expect(wrapper.vm.historyIndex).toBe(0)

    // 测试重做
    await wrapper.vm.redo()
    expect(wrapper.vm.config.companyName).toBe('新公司名称')
    expect(wrapper.vm.historyIndex).toBe(1)
  })

  //   // 撤销和重做按钮状态
  //   test('undo & redo button status test', async () => {
  //     // 初始状态
  //     expect(wrapper.vm.historyIndex).toBe(0)
  //     expect(wrapper.vm.history.length).toBe(1)

  //     // 撤销应该被禁用
  //     expect(wrapper.vm.undo).toBe(false)

  //     // 添加历史记录
  //     wrapper.vm.config.companyName = '新记录'
  //     await wrapper.vm.saveToHistory()

  //     // 撤销应该可用，重做应该被禁用
  //     expect(wrapper.vm.undo).toBe(true)
  //     expect(wrapper.vm.redo).toBe(false)
  //   })

  // 应用模板功能
  test('apply template test', async () => {
    const template = {
      name: '测试模板',
      config: {
        companyName: '模板公司',
        color: '#3498db',
        sealType: 'contract'
      }
    }

    await wrapper.vm.applyTemplate(template)

    expect(wrapper.vm.config.companyName).toBe('模板公司')
    expect(wrapper.vm.config.color).toBe('#3498db')
    expect(wrapper.vm.config.sealType).toBe('contract')
    expect(wrapper.vm.history.length).toBe(2) // 应该保存到历史记录
  })

  // 重置配置功能
  test('reset test', async () => {
    // 修改配置
    wrapper.vm.config.companyName = '修改后的公司'
    wrapper.vm.config.color = '#000000'

    // 重置配置
    await wrapper.vm.resetConfig()

    expect(wrapper.vm.config.companyName).toBe('示例科技有限公司')
    expect(wrapper.vm.config.color).toBe('#e74c3c')
    expect(wrapper.vm.history.length).toBe(2) // 应该保存到历史记录
  })

  //   test('模板选择功能', async () => {
  //     const templateItems = wrapper.findAll('.template-item')
  //     expect(templateItems.length).toBe(4) // 4个预设模板

  //     // 点击第一个模板
  //     await templateItems[0].trigger('click')
  //     expect(wrapper.vm.currentTemplate).toBe(0)

  //     // 检查配置是否应用
  //     expect(wrapper.vm.config.sealType).toBe('company')
  //     expect(wrapper.vm.config.color).toBe('#e74c3c')
  //   })

  //   test('响应式配置更新', async () => {
  //     // 测试公司名称更新
  //     const companyInput = wrapper.find('input[placeholder="输入单位名称"]')
  //     await companyInput.setValue('新的公司名称')
  //     expect(wrapper.vm.config.companyName).toBe('新的公司名称')

  //     // 测试印章类型选择
  //     const typeSelect = wrapper.find('select')
  //     await typeSelect.setValue('personal')
  //     expect(wrapper.vm.config.sealType).toBe('personal')

  //     // 测试颜色选择
  //     const colorInput = wrapper.find('input[type="color"]')
  //     await colorInput.setValue('#3498db')
  //     expect(wrapper.vm.config.color).toBe('#3498db')
  //   })

  //   test('导出格式选择', async () => {
  //     const formatSelect = wrapper.find('select[v-model="exportFormat"]')
  //     await formatSelect.setValue('jpeg')
  //     expect(wrapper.vm.exportFormat).toBe('jpeg')

  //     await formatSelect.setValue('svg')
  //     expect(wrapper.vm.exportFormat).toBe('svg')
  //   })

  //   test('按钮状态根据数据URL变化', async () => {
  //     // 初始状态没有数据URL，下载按钮应该被禁用
  //     wrapper.vm.sealDataUrl = ''
  //     await wrapper.vm.$nextTick()

  //     const downloadButton = wrapper.find('.btn-secondary')
  //     const copyButton = wrapper.find('.btn-copy')
  //     expect(downloadButton.attributes('disabled')).toBeDefined()
  //     expect(copyButton.attributes('disabled')).toBeDefined()

  //     // 设置数据URL后，按钮应该可用
  //     wrapper.vm.sealDataUrl = 'data:image/png;base64,test'
  //     await wrapper.vm.$nextTick()

  //     expect(downloadButton.attributes('disabled')).toBeUndefined()
  //     expect(copyButton.attributes('disabled')).toBeUndefined()
  //   })

  //   test('预览模态框功能', async () => {
  //     // 初始状态模态框应该隐藏
  //     expect(wrapper.vm.showPreview).toBe(false)
  //     expect(wrapper.find('.preview-modal').exists()).toBe(false)

  //     // 设置数据URL并显示预览
  //     wrapper.vm.sealDataUrl = 'data:image/png;base64,test'
  //     wrapper.vm.showPreview = true
  //     await wrapper.vm.$nextTick()

  //     // 模态框应该显示
  //     expect(wrapper.find('.preview-modal').exists()).toBe(true)
  //     expect(wrapper.find('.modal-content img').attributes('src')).toBe('data:image/png;base64,test')

  //     // 点击关闭按钮应该隐藏模态框
  //     const closeButton = wrapper.find('.btn-close')
  //     await closeButton.trigger('click')
  //     expect(wrapper.vm.showPreview).toBe(false)
  //   })

  //组件卸载时清理资源
  test('component destory clear test', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })
})
