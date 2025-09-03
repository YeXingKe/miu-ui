import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { MiuSignture } from '@miu-ui/components'

// 组件渲染测试：验证组件是否正确渲染所有必需的元素
// 初始状态测试：确保画布上下文正确初始化
// 鼠标事件测试：模拟鼠标按下、移动和释放事件，验证绘制功能
// 触摸事件测试：模拟触摸事件，验证移动设备支持
// 清除功能测试：验证清除按钮能正确重置画布
// 属性设置测试：验证颜色和粗细设置功能
// 保存功能测试：验证保存功能能正确生成数据URL
// 撤销功能测试：验证撤销功能能恢复之前的状态
// 响应式测试：验证画布能正确响应窗口大小变化
// 生命周期测试：验证组件卸载时正确清理资源

// vi是一个工具对象
// 创建符合 DOMRect 接口的模拟对象
const createMockDOMRect = (rect: Partial<DOMRect>): DOMRect => ({
  x: rect.x || 0,
  y: rect.y || 0,
  width: rect.width || 0,
  height: rect.height || 0,
  left: rect.left || 0,
  top: rect.top || 0,
  right: rect.right || 0,
  bottom: rect.bottom || 0,
  toJSON: vi.fn() // 添加缺失的 toJSON 方法
})
// 模拟 CanvasRenderingContext2D
const mockContext = {
  lineWidth: 2,
  strokeStyle: '#000000',
  lineCap: 'round', // 设置线条端点为圆形 - 使笔画开始和结束圆润
  lineJoin: 'round', // 设置线条连接点为圆形 - 使转折处圆滑
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn()
}

// 模拟 HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any)
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock-data')

// describe 可以在当前上下文中定义一个新的测试套件
// expect 用于创建断言,断言 是可以被调用来验证一个语句的函数
describe('signature component test', () => {
  let wrapper: VueWrapper<any>

  let mockGetBoundingClientRect

  beforeEach(async () => {
    // 创建符合 DOMRect 接口的模拟返回值
    const mockRect = createMockDOMRect({
      left: 10,
      top: 20,
      width: 600,
      height: 300,
      right: 610,
      bottom: 320,
      x: 10,
      y: 20
    })

    // 创建模拟函数
    mockGetBoundingClientRect = vi.fn(() => mockRect)

    // 正确模拟 getBoundingClientRect
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      value: mockGetBoundingClientRect,
      writable: true
    })

    // 创建组件实例
    // 挂载一个 Vue 组件并返回一个包装器（Wrapper）
    // 这个包装器包含了许多用于测试组件的方法
    wrapper = mount(MiuSignture, {
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()
    // 手动设置组件的 ctx 属性为模拟上下文
    wrapper.vm.ctx = mockContext
  })

  // 它接收测试名称和保存测试期望的函数
  test('component rendered', () => {
    // 检查Canvas元素是否存在
    expect(wrapper.find('canvas').exists()).toBe(true)

    // 检查控制按钮是否存在
    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true)

    // 检查线条控制元素是否存在
    // expect(wrapper.find('[data-testid="line-width"]').exists()).toBe(true)
    // expect(wrapper.find('[data-testid="line-color"]').exists()).toBe(true)
  })
  // 初始化时 Canvas 上下文设置正确
  test('init canvas context', () => {
    // 检查 Canvas 上下文是否已初始化
    expect(wrapper.vm.ctx).toBeDefined()

    // 检查上下文设置
    expect(wrapper.vm.ctx.lineCap).toBe('round')
    expect(wrapper.vm.ctx.lineJoin).toBe('round')
    expect(wrapper.vm.ctx.lineWidth).toBe(2)
    expect(wrapper.vm.ctx.strokeStyle).toBe('#000')
  })

  // 鼠标按下事件开始绘制路径
  test('mouse movedown event drawing', async () => {
    const canvas = wrapper.find('canvas')

    // 模拟鼠标按下事件
    await canvas.trigger('mousedown', {
      clientX: 50,
      clientY: 60
    })

    // 检查是否调用了 beginPath 和 moveTo
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalledWith(40, 40) // 50-10=40, 60-20=40

    // 检查绘制状态
    expect(wrapper.vm.isDrawing).toBe(true)
    expect(wrapper.vm.hasDrawing).toBe(true)
  })

  // 鼠标移动事件绘制线条
  test('mouse move event drawing', async () => {
    const canvas = wrapper.find('canvas')

    // 先触发鼠标按下
    await canvas.trigger('mousedown', {
      clientX: 50,
      clientY: 60
    })

    // 重置模拟函数调用记录
    vi.clearAllMocks()

    // 模拟鼠标移动
    await canvas.trigger('mousemove', {
      clientX: 70,
      clientY: 80
    })

    // 检查是否调用了 lineTo 和 stroke
    expect(mockContext.lineTo).toHaveBeenCalledWith(60, 60) // 检查参数 70-10=60, 80-20=60
    expect(mockContext.stroke).toHaveBeenCalled() // 是否调用一次函数
  })

  // 鼠标释放事件停止绘制
  test('mouse moveup event stop draw', async () => {
    const canvas = wrapper.find('canvas')

    // 先触发鼠标按下和移动
    await canvas.trigger('mousedown', {
      clientX: 50,
      clientY: 60
    })
    await canvas.trigger('mousemove', {
      clientX: 70,
      clientY: 80
    })

    // 确保正在绘制
    expect(wrapper.vm.isDrawing).toBe(true)

    // 模拟鼠标释放
    await canvas.trigger('mouseup')

    // 检查是否停止绘制
    expect(wrapper.vm.isDrawing).toBe(false)
  })

  // 触摸事件处理
  test('touch event handle', async () => {
    const canvas = wrapper.find('canvas')

    // 模拟触摸开始
    await canvas.trigger('touchstart', {
      touches: [
        {
          clientX: 50,
          clientY: 60
        }
      ]
    })

    // 检查是否开始绘制
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalledWith(40, 40)
    expect(wrapper.vm.isDrawing).toBe(true)

    // 重置模拟函数调用记录
    vi.clearAllMocks()

    // 模拟触摸移动
    await canvas.trigger('touchmove', {
      touches: [
        {
          clientX: 70,
          clientY: 80
        }
      ]
    })

    // 检查是否绘制线条
    expect(mockContext.lineTo).toHaveBeenCalledWith(60, 60)
    expect(mockContext.stroke).toHaveBeenCalled()

    // 模拟触摸结束
    await canvas.trigger('touchend')

    // 检查是否停止绘制
    expect(wrapper.vm.isDrawing).toBe(false)
  })

  // 清除画布功能
  test('clear canvas', async () => {
    // 先设置有绘制内容
    wrapper.vm.hasDrawing = true

    // 调用清除方法
    await wrapper.vm.clearCanvas()

    // 检查是否调用了 clearRect
    expect(mockContext.clearRect).toHaveBeenCalled()

    // 检查状态是否重置
    expect(wrapper.vm.hasDrawing).toBe(false)
  })

  // // 窗口大小变化时重新初始化画布
  // test('窗口大小变化时重新初始化画布', async () => {
  //   // 保存原始方法
  //   const originalInitCanvasSize = wrapper.vm.initCanvasSize
  //   const originalRedrawCanvas = wrapper.vm.redrawCanvas

  //   // 模拟方法
  //   wrapper.vm.initCanvasSize = vi.fn()
  //   wrapper.vm.redrawCanvas = vi.fn()

  //   // 触发窗口大小变化事件
  //   window.dispatchEvent(new Event('resize'))

  //   // 等待下一个tick
  //   await wrapper.vm.$nextTick()

  //   // 检查是否调用了重新初始化方法
  //   expect(wrapper.vm.initCanvasSize).toHaveBeenCalled()
  //   expect(wrapper.vm.redrawCanvas).toHaveBeenCalled()

  //   // 恢复原始方法
  //   wrapper.vm.initCanvasSize = originalInitCanvasSize
  //   wrapper.vm.redrawCanvas = originalRedrawCanvas
  // })

  // 组件卸载时移除事件监听器
  test('component destory removeEventListener', async () => {
    // 模拟 removeEventListener
    const originalRemove = window.removeEventListener
    window.removeEventListener = vi.fn()

    // 卸载组件
    wrapper.unmount()

    // 检查是否移除了事件监听器
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))

    // 恢复原始方法
    window.removeEventListener = originalRemove
  })
})
