# 低代码平台 🚀

开发版本：node >=V20.10.0

![项目徽章](https://img.shields.io/badge/版本-1.0.0-blue)
![License](https://img.shields.io/github/license/YeXingKe/miu-ui.git)

> 一句话描述项目的核心价值

- 服务于后台管理平台的企业级中后台组件解决方案

## 📌 目录

- [功能特性](#✨-功能特性)
- [快速开始](#🚀-快速开始)
- [安装指南](#🔧-安装指南)
- [许可证](#📜-许可证)

## 🏠 组件理念

> 核心设计理念

- 添砖加瓦，而非推倒重来 (Augmentation, Not Reinvention)
  - 理念： 充分尊重和利用底层 UI 库（如 Element-Plus）的能力和价值。在其强大的基础上，针对特定业务场景进行增强和补充。
  - 体现： 保持 API 设计风格与底层库一致，优先考虑属性/事件/插槽的透传，让使用者感觉像是在用一个“更强”的 Element-Plus。
- 面向业务，而非面向技术 (Business-Oriented, Not Technology-Oriented)
  - 理念： 组件的抽象维度是业务功能，而非技术功能。你封装的是一个“地址选择器”，而不是一个“下拉框与API的集合”；你提供的是一个“数据表格页”，而不是一个“分页、表格、搜索框的布局”。
  - 体现： 组件命名、Props 设计、发射的事件都应该使用业务领域的语言（Ubiquitous Language），让业务开发者一眼就能看懂其用途。
- 一致性 over 灵活性 (Consistency over Flexibility)
  - 理念： 在企业级应用中，统一的用户体验和代码规范远比极致的灵活性重要。你的组件库应该在 80% 的常见场景下提供“开箱即用”的最佳实践，通过合理的约束来杜绝代码和UI的碎片化。对于另外20%的特殊场景，应提供优雅的逃生舱（Escape Hatches）。
  - 体现： 提供严格的默认样式、预设的行为逻辑（如请求防抖）、统一的校验规则等。
- 开发者体验是第一生产力 (Developer Experience as Priority)
  - 理念： 组件库的消费者是开发者。极致的开发者体验（DX）能大幅提升团队效率。这包括完善的 TypeScript 支持、智能的代码提示、清晰的文档和易用的示例。
  - 体现： 严格的类型定义、泛型组件、VSCode 自动补全、交互式演示文档。

> 架构角度

- 横向分层架构
  | 层级 | 功能 | 例子 | 技术实现 |
  |------------|----------|---------------|---------------|
  | ✅业务场景层 (Templates/Scenes) | 最高层抽象，提供完全开箱即用的完整业务模块或页面模板。 | DataManagementPage (包含表格、搜索、分页、批量操作) | 基于下层组件通过 Slots 组合而成，可能依赖特定的 Vue Router / Pinia 结构。 |
  | ✅业务组件层 (Business Components) | 核心价值层，封装了特定领域的业务逻辑和交互 | UserSearchSelect, UploadImageWithOSS, EnterpriseDataTable | 组合多个基础组件和 Composables，集成 API 调用，实现复杂逻辑 |
  | ✅基础组件层 (Base Components) | 对底层UI库的轻度封装，统一样式、国际化、解决常见问题 | aseButton, BaseDialog, BaseSearchBar | 包装 Element-Plus 组件，统一 size、z-index，添加全局 loading 状态等。 |
  | ✅工具与抽象层 (Utils & Composables) | 最底层，提供纯逻辑复用，与UI无关。是整个组件库的基石。 | useAsyncData, useFormValidation, constants | Vue 3 Composables，工具函数，类型定义，API 请求库封装。|

**高内聚低耦合**： 每层职责单一，下层变更不影响上层。例如，更换底层UI库（从 Element-Plus 到 Ant Design）只需重写基础组件层，而上层业务组件几乎不动。
**极强的可复用性**： useAsyncData 这样的 Composables 既可以被业务组件使用，也可以直接被业务项目使用。
**清晰的维护边界**： 不同层由不同专长的人维护（如CSS专家维护基础组件，业务专家维护业务组件）。

- 纵向切面关注点

- TypeScript 体系 (Type System)

  - 全局类型定义： 定义统一的业务数据类型（如 Response<T>，UserInfo），所有层都遵循这些定义。
  - 严格的组件类型：
  - 泛型的大量应用： 特别是对于表格、下拉框等数据驱动组件。BusinessTable<T> 的列配置、行数据回调都应有完整的类型推断。
  - Props 类型推导： 使用 defineProps 与类型字面量或泛型，确保使用者能获得精确的提示。
  - 事件类型： 使用 defineEmits 严格定义组件发出的事件类型和 payload。

- 样式体系 (Styling System)

  - 设计令牌 (Design Tokens)： 使用 CSS Variables (CSS 自定义属性) 定义一套所有层级都遵循的样式变量体系（色彩、间距、字体、阴影等）。这是实现一键换肤和保持样式一致性的基础。
  - CSS 方案： 推荐采用 CSS-in-JS (如 unocss， vue-use 的 useCssVar) 或 Scoped CSS。关键在于避免样式污染，并确保样式能被轻松覆盖。
  - 命名规范 (BEM)： 采用 BEM 等命名规范，避免类名冲突。

- 通信与状态 (Communication & State)

  - Props/Events： 父子组件通信的首选，保持单向数据流。
  - Provide/Inject： 用于跨层级组件通信。例如，在 BusinessTable 中提供 getSelection 方法，供其深处的操作按钮组件注入调用。
  - 状态管理： 组件库自身应避免直接依赖外部的状态管理库（如 Pinia）。内部状态优先使用 reactive/ref。如果需要与外部状态联动，应通过 Props 或 Events 进行。

- 工程化与生态 (Engineering & Ecosystem)

  - 构建与打包 (Build & Bundle)： 使用 Vite Library Mode 或 Rollup 进行构建。配置必须支持 ES Module 和 Tree Shaking，确保按需引入。
  - 文档与演示 (Documentation)： 使用 Storybook 或 VitePress。文档应包含：功能描述、API 表格、可交互的 Demo、代码示例。这是组件库的“门面”。

- 质量保障 (Quality Assurance)：
  - 单元测试： 使用 Vitest 对工具函数、Composables 和组件的纯逻辑进行测试。
  - 集成测试： 使用 Cypress 或 Playwright 对关键用户交互流程进行测试。
  - 发布与部署 (CI/CD)： 接入 GitHub Actions 等 CI/CD 工具，自动化完成测试、打包、版本号升级、发布到 NPM 私有仓库、部署文档站等一系列流程。

## ✨ 功能特性

- **核心功能1**：基础封装与增强（Props 透传与继承、Slots 透传、双向绑定 (v-model) 增强）
- **核心功能2**：业务逻辑抽象（组合式函数 (Composables) 抽离、数据请求的统一管理、全局配置）
- **核心功能3**：TypeScript 深度集成（严格的类型定义、泛型组件的应用）
- **核心功能4**：工程化与维护（模块化与树摇 (Tree-shaking)、文档与可视化开发 (Storybook)、单元测试（Vitest））

## 🚀 快速开始

```bash
# 最小化运行示例
pnpm i
pnpm dev
```

## 🔧 安装指南

### 环境要求

- Node.js >= 20.12.0

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/YeXingKe/miu-ui.git
   ```
2. 安装依赖：
   ```bash
   cd miu-ui
   corepack enable      # 只需一次，激活 corepack（Node 16+ 自带），初始化packageManager
   corepack pnpm i
   ```
3. miu-ui组件安装：
   ```bash
   pnpm i miu-ui
   ```

## 📜 许可证

[MIT](LICENSE) © 2025 [YeXingKe]
