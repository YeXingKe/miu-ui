export class SelectOptions {
  constructor(init?: SelectOptions) {
    this.disabled = false

    if (init) {
      Object.assign(this, init)
    }
  }
  value?: string
  label?: string
  disabled?: boolean
  key?: string
}
