export interface City {
  id: number
  spell: string // 拼音
  name: string // 名字
}

export interface GroupObject {
  name?: string
  /**
   *  true:列表容器内的列表单元可以被移出；
   *  false:列表容器内的列表单元不可以被移出；
   * 'clone':列表单元移出，移动的为该元素的副本；
   * Function:用来进行pull的函数判断，可以进行复杂逻辑，在函数中return false/true来判断是否移出；
   */
  pull?: boolean | 'clone' | Function
  /**
   * 定义往这个列表容器放置列表单元的的设置
   *  true:列表容器可以从其他列表容器内放入列表单元；
   */
  put?: boolean | Array<string> | Function
}

export class Draggable {
  constructor(init?: Draggable) {
    if (init) {
      Object.assign(this, init)
    }
  }
  /**
   *  元素id
   */
  group?: string | GroupObject
  /**
   * 列表单元是否可以在列表容器内进行拖拽排序
   */
  sort?: boolean
  /**
   * 鼠标选中列表单元可以开始拖动的延迟时间
   */
  delay?: number
  /**
   *  boolean 定义是否此sortable对象是否可用
   */
  disabled?: boolean
  /**
   *  单位:ms，定义排序动画的时间
   */
  animation?: number = 150
  /**
   * 简单css选择器的字符串，使列表单元中符合选择器的元素成为拖动手柄
   * 格式:'.draggable'
   */
  handle?: string
  /**
   * 过滤器，不需要进行拖动的元素
   * 格式:'.draggable'
   * 可设置为多个选择器，中间用“，”分隔
   */
  filter?: string
  /**
   * 在触发过滤器`filter`的时候调用`event.preventDefault()`
   */
  preventOnFilter?: boolean = false
  /**
   * 允许拖拽的项目类名
   */
  draggable?: string
  /**
   * 拖拽时placeholder的css类名
   * 给这个影子单元添加一个class
   */
  ghostClass?: string
  /**
   * 被选中项的css 类名
   */
  chosenClass?: string
  /**
   * 正在被拖拽中的css类名
   */
  dragClass?: string
  /**
   * 忽略 HTML5拖拽行为，强制回调进行
   */
  forceFallback?: boolean = false
  /**
   * 当排序的容器是个可滚动的区域，拖放可以引起区域滚动
   */
  scroll?: boolean = true

  /**
   * 列表单元被选中的回调函数
   */
  onChoose?: (event: Event) => void
  /**
   * 元素未被选中的时候（从选中到未选中）
   */
  onUnchoose?: (event: Event) => void
  /**
   * 列表的任何更改都会触发
   */
  onSort?: (event: Event) => void
  /**
   * 列表单元拖动开始的回调函数
   */
  onStart?: (event: Event) => void
  /**
   * 列表单元拖放结束后的回调函数
   */
  onEnd?: (event: Event) => void
  /**
   * 列表单元添加到本列表容器的回调函数
   */
  onAdd?: (event: Event) => void
  /**
   * 列表单元在列表容器中的排序发生变化后的回调函数
   */
  onUpdate?: (event: Event) => void
  /**
   * 列表元素移到另一个列表容器的回调函数
   */
  onRemove?: (event: Event) => void
  /**
   * 试图选中一个被filter过滤的列表单元的回调函数
   */
  onFilter?: (event: Event) => void
  /**
   *  当移动列表单元在一个列表容器中或者多个列表容器中的回调函数
   */
  onMove?: (event: Event, originalEvent: Event) => void
  /**
   * 当创建一个列表单元副本的时候的回调函数
   */
  onClone?: (event: Event) => void
  /**
   * 拽元素改变位置的时候
   */
  onChange?: (event: Event) => void
}
