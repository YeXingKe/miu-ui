## 1、根目录执行命令gulp --require @esbuild-kit/cjs-loader -f gulpfile.ts找不到@esbuild-kit/cjs-loader模块

gulp --require ./node_modules/@esbuild-kit/cjs-loader -f gulpfile.ts

## 2、corepack enable

允许项目通过 package.json 的 packageManager 字段锁定包管理器版本

## 3、调试方式

1、先定位问题出现区域，然后根据需要以行为参考注释掉调试
2、页面空白，控制台没报错，应该某个值判断没通过，直接出问题前后打印值

强制在根目录上安装依赖：
pnpm i -w <package-name>
在目录上执行查询调试路径
node -e "console.log(require.resolve('@miu-ui/build-utils'))"
