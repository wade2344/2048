import { expect, test } from 'vitest'
import { createEmptyBoard } from './index'
import { defaultBoard } from '@infinite/game-config'

test('clients can construct independent empty rows from shared configuration', () => {
  const board = createEmptyBoard(defaultBoard)
  expect(board).toHaveLength(4)
  for (const row of board) expect(row).toEqual([null, null, null, null])
  expect(new Set(board).size).toBe(4)
})
