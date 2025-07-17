module.exports = {
  // 用于指定代码的运行环境，可以配置多个环境，包括浏览器、Node.js、ES6等。
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  // 用于指定代码解析器的选项
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  parser: 'vue-eslint-parser',
  // 用于继承已有的规则配置
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:storybook/recommended'],
  plugins: ['vue', '@typescript-eslint'],
  // 用于指定自定义规则
  rules: {
    'vue/no-mutating-props': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/attributes-order': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-valid-default-prop': 'off',
    'vue/no-template-shadow': 'off',
    'vue/valid-template-root': 'off',
    'vue/no-unused-vars': 'off',
    'vue/valid-v-for': 'off',
    'vue/no-ref-as-operand': 'off',
    'vue/require-v-for-key': 'off',
    'vue/prefer-import-from-vue': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/no-setup-props-destructure': 'off',
    'vue/v-on-event-hyphenation': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-const': 'off',
    'no-useless-escape': 'off',
    'no-empty': 'off',
    'no-unreachable': 'off',
    'no-undef': 'off',
    'no-self-assign': 'off',
    'no-prototype-builtins': 'off',
    'no-cond-assign': 'off',
    'no-fallthrough': 'off'
  }
}
