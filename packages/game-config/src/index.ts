export interface BoardConfig { readonly size: number }

export const defaultBoard: BoardConfig = { size: 4 }
export * from './levels'
export * from './skills'
export * from './energy'
