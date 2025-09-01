/// <reference types="vitest/config" />  
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  build: {
    lib: {
      entry: './packages/components/index.ts',
      name: 'MiuUi'
      // fileName:(format)=>`miu-ui.${format}.js`,
      // formats:['es','umd'],
    },
    rollupOptions: {
      external: ['vue', 'element-plus'],
      //   output:{
      //     globals:{
      //       vue:'Vue',
      //       'elemet-plus':'ElementPlus',
      //     },
      //     entryFileNames:'[name].js',
      //     dir:'lib',
      //     preserveModules:true,// 保留模块结构
      //     inlineDynamicImports: false,
      //     preserveModulesRoot:'packages' // 指定根目录
      //   }
      output: [
        {
          //打包格式
          format: 'es',
          //打包后文件名
          entryFileNames: '[name].es.js'
          //让打包目录和我们目录对应
          // preserveModules: true,
          // 你的源代码中使用了ES模块的导出语法（例如export function foo() {}或export const bar = ...），Rollup将会保持这种导出模式，生成的bundle会暴露这些导出为命名导出
          // exports: 'named'
        }
        // {
        //   //打包格式
        //   format: 'umd',
        //   //打包后文件名
        //   entryFileNames: '[name].umd.js',
        //   //让打包目录和我们目录对应
        //   // preserveModules: true,
        //   // exports: 'named'
        //   // inlineDynamicImports: false,
        //   // manualChunks(id) {
        //   //   if (id.includes('node_modules')) {
        //   //     if (
        //   //       id.toString().split('node_modules/')[1].split('/')[0].includes('mutiplexed-elplus')
        //   //     ) {
        //   //       return 'mutiplexed-elplus'
        //   //     } else {
        //   //       return 'index'
        //   //     }
        //   //   }
        //   // }
        // }
      ]
    }
  },
  test: {
    css: false,  // 1. 直接禁止加载任何 CSS 文件
    clearMocks: true, // 在每个测试用例之前自动清除所有模拟（mock）的调用和实例
    environment: 'jsdom',// 指定测试运行的环境。这里设置为`'jsdom'`，表示使用jsdom模拟浏览器环境
    setupFiles: ['./vitest.setup.ts'],// 通常用于设置测试环境，例如全局的polyfill、插件或配置
    reporters: ['default'],// 指定测试报告器
    deps: {
      // 将 element-plus 添加到内联依赖
      inline: [/element-plus/]
    },
    testTransformMode: { // 指定测试中需要转换的模式  
      web: ['*.{ts,tsx}'], // 指定哪些文件需要被转换（transpile）为在web环境中运行的代码
    },
    coverage: { // 配置测试覆盖率相关设置
      reporter: ['text', 'json-summary', 'json'],
      exclude: [
        'packages/components/*/style/**',
        'node_modules',
        'dist',
      ],
    },
    // 定义多个测试项目（project）
    // projects: [
    //   {
    //     extends: true,
    //     plugins: [
    //       // The plugin will run tests for the stories defined in your Storybook config
    //       // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
    //       storybookTest({
    //         configDir: path.join(dirname, '.storybook')
    //       })
    //     ],
    //     test: {
    //       name: 'storybook',
    //       browser: {
    //         enabled: true,
    //         headless: true,
    //         provider: 'playwright',
    //         instances: [
    //           {
    //             browser: 'chromium'
    //           }
    //         ]
    //       },
    //       setupFiles: ['.storybook/vitest.setup.ts']
    //     }
    //   }
    // ]
  }
})
