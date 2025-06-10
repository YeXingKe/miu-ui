<template>
    <div>
        <el-button disabled>Default</el-button>
        <el-button type="primary" disabled>Primary</el-button>
        <el-button type="success" disabled>Success</el-button>
        <el-button type="info" disabled>Info</el-button>
        <el-button type="warning" disabled>Warning</el-button>
        <el-button type="danger" disabled>Danger</el-button>
    </div>
</template>

<script lang="ts">
import { ElButton } from "element-plus";
import { defineComponent } from "vue"

export default defineComponent({
    name:'MiuButton',
    components:{
        ElButton,
    }
})
</script>

<style lang="scss" scoped>


</style>