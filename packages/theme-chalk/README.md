# element-theme-chalk

> element component chalk theme.

## Installation

```shell
npm i miu-ui
```

## Usage

Use Sass import

```css
@use 'miu-ui/lib/theme-chalk/index.scss';
```

Or Use vite/webpack

```javascript
import 'miu-ui/lib/theme-chalk/index.css'
```

Or

```html
<link rel="stylesheet" href="https://unpkg.com/miu-ui/lib/theme-chalk/index.css" />
```

## Import on demand

```javascript
import 'miu-ui/lib/theme-chalk/input.css'
import 'miu-ui/lib/theme-chalk/select.css'

// ...
```

## 作用

所有组件的可复用样式统一抽到 theme-chalk 包里，组件源码里不再保留 <style> 标签，而是在 style/index.ts 中按需引入 theme-chalk 里对应的 CSS/SCSS 文件；这样既避免重复代码，也让用户能够自由选择“全量主题”或“按需加载样式”
