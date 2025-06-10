/**
 *
 * 原生 prop `类型，BooleanConstructor`、`StringConstructor`、`null`、`undefined` 等
 */
export type NativePropType = ((...args: any) => any) | { new (...args: any): any } | undefined | null
