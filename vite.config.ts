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
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium'
              }
            ]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  }
})
