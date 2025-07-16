import { resolve } from 'path'

// projRoot= D:\develop\github\person\miu-ui
export const projRoot = resolve(__dirname, '..', '..', '..')
export const pkgRoot = resolve(projRoot, 'packages') // miu-ui/packages
export const compRoot = resolve(pkgRoot, 'components') // miu-ui/packages/components/
export const themeRoot = resolve(pkgRoot, 'theme-chalk') // miu-ui/packages/theme-chalk
// export const hookRoot = resolve(pkgRoot, 'hooks')
export const localeRoot = resolve(pkgRoot, 'locale')
// export const directiveRoot = resolve(pkgRoot, 'directives')
export const epRoot = resolve(pkgRoot, 'miu-ui') // miu-ui/packages/miu-ui
export const utilRoot = resolve(pkgRoot, 'utils') // miu-ui/packages/utils
export const buildRoot = resolve(projRoot, 'internal', 'build') // miu-ui/internal/build

// Docs
export const docsDirName = 'docs'
export const docRoot = resolve(projRoot, docsDirName)
export const vpRoot = resolve(docRoot, '.vitepress')

/** `/dist` */
export const buildOutput = resolve(projRoot, 'dist')
/** `/dist/miu-ui` */
export const epOutput = resolve(buildOutput, 'miu-ui')

export const projPackage = resolve(projRoot, 'package.json')
export const compPackage = resolve(compRoot, 'package.json')
export const themePackage = resolve(themeRoot, 'package.json')
// export const hookPackage = resolve(hookRoot, 'package.json')
export const localePackage = resolve(localeRoot, 'package.json')
// export const directivePackage = resolve(directiveRoot, 'package.json')
export const epPackage = resolve(epRoot, 'package.json')
export const utilPackage = resolve(utilRoot, 'package.json')
export const docPackage = resolve(docRoot, 'package.json')
