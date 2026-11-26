import { expect, test } from 'vitest'
import { moveBoard, type Direction } from './index'

const examples: [number[], number[], number][] = [
  [[2,2,2,2], [4,4,0,0], 8],
  [[2,2,4,0], [4,4,0,0], 4],
  [[4,0,4,4], [8,4,0,0], 8],
  [[2,0,2,2], [4,2,0,0], 4],
  [[4,2,0,0], [4,2,0,0], 0],
]
function fixture(values: number[], direction: Direction) {
  return Object.freeze(Array.from({length: 4}, (_, r) => Object.freeze(Array.from({length: 4}, (_, c) => {
    const vertical = direction === 'up' || direction === 'down'
    const offset = vertical ? r : c
    const index = direction === 'down' || direction === 'right' ? 3-offset : offset
    const value = (vertical ? c : r) === 1 ? values[index] : 0
    return value ? Object.freeze({id: String(index), value}) : null
  }))))
}

for (const direction of ['left','right','up','down'] as const) {
  test.each(examples)(direction + ' %j', (input, expected, score) => {
    const original = fixture(input, direction)
    const result = moveBoard(original, direction)
    const values = result.board.map(row => row.map(tile => tile?.value ?? 0))
    expect(values).toEqual(fixture(expected, direction).map(row => row.map(tile => tile?.value ?? 0)))
    expect(values.flat().reduce((a,b) => a+b,0)).toBe(input.reduce((a,b) => a+b,0))
    expect(result.score).toBe(score)
    expect(result.changed).toBe(input.some((v,i) => v !== expected[i]))
    if (!result.changed) {
      expect(result.events).toEqual([])
      expect(result.board).toBe(original)
    }
  })
}
test('slides across gaps and links both merge sources to the surviving tile', () => {
  const result = moveBoard(fixture([0,2,0,2],'left'), 'left')
  expect(result.board[1]![0]).toEqual({id:'1',value:4})
  expect(result.events).toEqual([
    {type:'TILE_MOVED', id:'1', from:[1,1], to:[1,0]},
    {type:'TILE_MOVED', id:'3', from:[1,3], to:[1,0]},
    {type:'TILE_MERGED', ids:['1','3'], to:[1,0], value:4},
  ])
})
test('slide without merging changes layout without scoring', () => {
  const result = moveBoard(fixture([0,2,4,0],'left'),'left')
  expect(result.changed).toBe(true)
  expect(result.score).toBe(0)
  expect(result.events.map(event => event.type)).toEqual(['TILE_MOVED','TILE_MOVED'])
})
