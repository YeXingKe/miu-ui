declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    MiuChooseCity: (typeof import('miu-ui'))['MiuChooseCity']
    MiuNation: (typeof import('miu-ui'))['MiuNation']
    MiuSelect: (typeof import('miu-ui'))['MiuSelect']
  }
}

export {}
