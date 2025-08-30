<template>
  <div class="miu" ref="listRef">
    <div class="item">苹果</div>
    <div class="item">香蕉</div>
    <div class="item">橙子</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Sortable from 'sortablejs'
import { Draggable } from './draggable'
defineOptions({
  name: 'MiuDraggable'
})
const listRef = ref(null)
onMounted(() => {
  new Sortable(
    listRef.value,
    new Draggable({
      animation: 150, // 拖拽时 150 ms 平滑动画
      ghostClass: 'blue-background-class',
      onAdd: event => {
        console.log(event, '---onAdd')
      },
      onChange: event => {
        console.log(event, '---onChange')
      }
    })
  )
})
</script>

<style lang="scss" scoped>
.miu {
  width: 300px;

  .item {
    width: 100%;
    height: 100px;
    border: 1px solid grey;
    // background-color: olivedrab;
  }
}

.blue-background-class {
  background-color: orange;
}
</style>
