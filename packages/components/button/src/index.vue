<template>
  <button
    :class="[
      'mc-button',
      `mc-button--${type}`,
      `mc-button--${size}`,
      {
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle,
        'is-disabled': disabled,
        'is-loading': loading
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="$slots.default" class="mc-button__text">
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'MiuButton'
})

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val: string) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(val)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val: string) => ['large', 'medium', 'small', 'mini'].includes(val)
  },
  icon: String,
  plain: Boolean,
  round: Boolean,
  circle: Boolean,
  disabled: Boolean,
  loading: Boolean
})

const emit = defineEmits(['click'])

const handleClick = (evt: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', evt)
  }
}
</script>
