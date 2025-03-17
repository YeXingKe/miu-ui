const fs = require('fs')
const path = require('path')
const args = process.argv.slice(2) // 获取命令行参数，slice(2)是为了去掉前两个固定参数（node路径和脚本路径）
const argToCheck = '--p' // 定义你要检查的命令行参数,发布状态

const installString = 'registry=https://registry.npmmirror.com/' // 安装依赖时的配置
const iDeg = /registry=https:\/\/registry\.npmmirror\.com\//
const publishString = 'registry=https://registry.npmjs.org/' // 发布时的配置
const pDeg = /registry=https:\/\/registry\.npmjs\.org\//
// 文件路径
const filePath = path.join(__dirname, '.npmrc') // 替换为你的文件路径

// 读取文件内容
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err)
    return
  }

  // 使用正则表达式替换registry的值
  const updatedData = args.includes(argToCheck)
    ? data.replace(iDeg, publishString)
    : data.replace(pDeg, installString)

  // 写回文件
  fs.writeFile(filePath, updatedData, 'utf8', err => {
    if (err) {
      console.error('写入文件失败:', err)
    } else {
      console.log('registry值已成功修改！')
    }
  })
})