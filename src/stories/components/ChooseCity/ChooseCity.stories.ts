import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { expect, userEvent, within } from 'storybook/test'

import MiuChooseCity from '@miu-ui/components/choose-city/src/index.vue'

const meta = {
  title: 'MiuChooseCity',
  component: MiuChooseCity,
  render: () => ({
    components: { MiuChooseCity },
    template: '<miu-choose-city />'
  }),
  parameters: {
    docs: {
      source: {
        // 直接指定模板代码
        code: ' <miu-choose-city />',
        type: 'code' // 强制显示静态代码
      },
      excludeStories: ['LoggedIn', 'LoggedOut'] // 隐藏但不删除
    }
  },

  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof MiuChooseCity>

export default meta
type Story = StoryObj<typeof meta>
// 当组件行为/样式会随登录状态变化时，应提供两种状态的故事
// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  // Storybook 7+ 的交互测试入口，自动在文档中执行
  play: async ({ canvasElement }: any) => {
    // 创建测试上下文，限定查询范围在当前组件内
    const canvas = within(canvasElement)
    // 通过 ARIA 角色 定位元素
    const loginCC = canvas.getByRole('button', { name: /Log in/i })
    // 断言元素是否存在
    await expect(loginCC).toBeInTheDocument()
    await userEvent.click(loginCC)
    await expect(loginCC).not.toBeInTheDocument()
    const logoutCC = canvas.getByRole('button', { name: /Log out/i })
    await expect(logoutCC).toBeInTheDocument()
  }
}

export const LoggedOut: Story = {}
