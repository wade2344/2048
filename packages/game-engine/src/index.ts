import type { BoardConfig } from '@infinite/game-config'

/** Empty matrix used to verify the shared configuration in both applications. */
export function createEmptyBoard({ size }: BoardConfig): null[][] {
  return Array.from({ length: size }, () => Array<null>(size).fill(null))
}
export * from './move'
export * from './random'
export * from './generation'
export * from './classic'
export * from './goal'
export * from './rewards'
export * from './energy'
