import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MiuSignature from '../src/signture.vue'

// 组件渲染测试：验证组件是否正确渲染所有必需的元素
// 初始状态测试：确保画布初始为空且相关按钮被禁用
// 绘制功能测试：模拟鼠标和触摸事件，验证绘制功能
// 清除功能测试：验证清除按钮能正确重置画布
// 保存功能测试：验证保存功能能正确触发事件并生成数据URL
// 属性传递测试：验证组件正确接收和处理属性
// 响应式测试：验证画布能正确响应窗口大小变化
// UI状态测试：验证按钮的启用/禁用状态与画布状态同步



// vi是一个工具对象

// 模拟Canvas API
class MockContext2D {
  lineWidth = 2
  strokeStyle = '#000000'
  lineCap = 'round'
  lineJoin = 'round'
  beginPath = vi.fn() // 创建一个模拟函数
  moveTo = vi.fn()
  lineTo = vi.fn()
  stroke = vi.fn()
  clearRect = vi.fn()
  fillRect = vi.fn()
}

// 全局模拟Canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => new MockContext2D() as any)

// describe 可以在当前上下文中定义一个新的测试套件
// expect 用于创建断言,断言 是可以被调用来验证一个语句的函数
describe('SignaturePad 组件', () => {
  let wrapper: any
  let mockContext: MockContext2D
  
  // 每个测试用例运行之前执行一些设置代码
  beforeEach(() => {
    // 创建组件实例
    // 挂载一个 Vue 组件并返回一个包装器（Wrapper）
    // 这个包装器包含了许多用于测试组件的方法
    wrapper = mount(MiuSignature, {
      props: {
        lineWidth: 2,
        lineColor: '#000'
      }
    })
    
    // 获取模拟的Canvas上下文
    mockContext = wrapper.vm.ctx
  })
  
  // 它接收测试名称和保存测试期望的函数
  test('组件正确渲染', () => {
    // 检查Canvas元素是否存在
    expect(wrapper.find('canvas').exists()).toBe(true)
    
    // 检查控制按钮是否存在
    expect(wrapper.find('[data-testid="clear-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true)
    
    // 检查线条控制元素是否存在
    // expect(wrapper.find('[data-testid="line-width"]').exists()).toBe(true)
    // expect(wrapper.find('[data-testid="line-color"]').exists()).toBe(true)
  })

  test('初始化时画布为空', () => {
    // 检查isEmpty状态
    expect(wrapper.vm.isEmpty).toBe(true)
    
    // 检查清除按钮是否禁用
    // expect(wrapper.find('[data-testid="clear-btn"]').attributes('disabled')).toBeDefined()
  })

  test('鼠标事件绘制功能', async () => {
    const canvas = wrapper.find('canvas')
    
    // 模拟鼠标按下事件
    await canvas.trigger('mousedown', { offsetX: 10, offsetY: 10 })
    
    // 检查是否开始绘制路径
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalledWith(10, 10)
    
    // 模拟鼠标移动事件
    await canvas.trigger('mousemove', { offsetX: 20, offsetY: 20 })
    
    // 检查是否绘制线条
    expect(mockContext.lineTo).toHaveBeenCalledWith(20, 20)
    expect(mockContext.stroke).toHaveBeenCalled()
    
    // 模拟鼠标释放事件
    await canvas.trigger('mouseup')
    
    // 检查isEmpty状态已更新
    expect(wrapper.vm.isEmpty).toBe(false)
    
    // 检查清除按钮已启用
    // expect(wrapper.find('[data-testid="clear-btn"]').attributes('disabled')).toBeUndefined()
  })

  test('触摸事件绘制功能', async () => {
    const canvas = wrapper.find('canvas')
    
    // 模拟触摸开始事件
    await canvas.trigger('touchstart', {
      touches: [{ clientX: 10, clientY: 10 }]
    })
    
    // 检查是否开始绘制路径
    expect(mockContext.beginPath).toHaveBeenCalled()
    
    // 模拟触摸移动事件
    await canvas.trigger('touchmove', {
      touches: [{ clientX: 20, clientY: 20 }]
    })
    
    // 检查是否绘制线条
    expect(mockContext.lineTo).toHaveBeenCalled()
    expect(mockContext.stroke).toHaveBeenCalled()
    
    // 模拟触摸结束事件
    await canvas.trigger('touchend')
    
    // 检查isEmpty状态已更新
    expect(wrapper.vm.isEmpty).toBe(false)
  })

  test('清除功能', async () => {
    // 先绘制一些内容
    const canvas = wrapper.find('canvas')
    await canvas.trigger('mousedown', { offsetX: 10, offsetY: 10 })
    await canvas.trigger('mousemove', { offsetX: 20, offsetY: 20 })
    await canvas.trigger('mouseup')
    
    // 确认画布不为空
    expect(wrapper.vm.isEmpty).toBe(false)
    
    // 点击清除按钮
    await wrapper.find('[data-testid="clear-btn"]').trigger('click')
    
    // 检查画布是否被清除
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, expect.any(Number), expect.any(Number))
    
    // 检查isEmpty状态已重置
    expect(wrapper.vm.isEmpty).toBe(true)
    
    // 检查清除按钮是否禁用
    expect(wrapper.find('[data-testid="clear-btn"]').attributes('disabled')).toBeDefined()
  })

  test('保存功能', async () => {
    // 设置监听器捕获save事件
    const onSave = vi.fn()
    wrapper.vm.$on('save', onSave)
    
    // 先绘制一些内容
    const canvas = wrapper.find('canvas')
    await canvas.trigger('mousedown', { offsetX: 10, offsetY: 10 })
    await canvas.trigger('mousemove', { offsetX: 20, offsetY: 20 })
    await canvas.trigger('mouseup')
    
    // 点击保存按钮
    await wrapper.find('[data-testid="save-btn"]').trigger('click')
    
    // 检查save事件已触发
    expect(onSave).toHaveBeenCalled()
    
    // 检查事件参数包含数据URL
    expect(onSave.mock.calls[0][0]).toContain('data:image/png')
  })

  test('线条粗细调整', async () => {
    const widthInput = wrapper.find('[data-testid="line-width"]')
    
    // 修改线条粗细
    await widthInput.setValue(5)
    
    // 检查Canvas上下文的lineWidth已更新
    expect(mockContext.lineWidth).toBe(5)
  })

  test('线条颜色调整', async () => {
    const colorInput = wrapper.find('[data-testid="line-color"]')
    
    // 修改线条颜色
    await colorInput.setValue('#ff0000')
    
    // 检查Canvas上下文的strokeStyle已更新
    expect(mockContext.strokeStyle).toBe('#ff0000')
  })

  test('响应式画布', async () => {
    // 模拟窗口大小变化
    window.dispatchEvent(new Event('resize'))
    
    // 等待防抖函数执行
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // 检查画布大小已调整
    const canvas = wrapper.find('canvas').element
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
  })

  test('属性传递', async () => {
    // 使用自定义属性重新挂载组件
    const customWrapper = mount(MiuSignature, {
      props: {
        lineWidth: 4,
        lineColor: '#ff0000',
        width: 400,
        height: 200
      }
    })
    
    // 检查属性是否正确应用
    expect(customWrapper.vm.ctx.lineWidth).toBe(4)
    expect(customWrapper.vm.ctx.strokeStyle).toBe('#ff0000')
    
    // 检查画布尺寸
    const canvas = customWrapper.find('canvas').element
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(200)
  })

  test('空画布时保存按钮禁用', async () => {
    // 初始状态为空画布
    expect(wrapper.vm.isEmpty).toBe(true)
    expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeDefined()
    
    // 绘制后保存按钮应启用
    const canvas = wrapper.find('canvas')
    await canvas.trigger('mousedown', { offsetX: 10, offsetY: 10 })
    await canvas.trigger('mouseup')
    
    expect(wrapper.vm.isEmpty).toBe(false)
    // expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeUndefined()
  })
})