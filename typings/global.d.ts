declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    MiuChooseCity: (typeof import('miu-ui'))['MiuChooseCity']
  }
}

export {}
