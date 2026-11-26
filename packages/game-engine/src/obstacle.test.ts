import { expect, test } from 'vitest'
import { moveBoard, enterLevel, createRandomSnapshot, type Direction, type Tile, type Obstacle } from './index'

const X = 'X'
const barrier = Object.freeze({kind:'obstacle'} as const)
function fixture(line: readonly (number|string)[], dir: Direction) {
  const board: (Tile | Obstacle | null)[][] = Array.from({length:4},()=>Array(4).fill(null))
  line.forEach((val, index) => {
    const i = dir === 'right' || dir === 'down' ? 3-index : index
    const vertical = dir === 'up' || dir === 'down'
    board[vertical ? i : 1]![vertical ? 1 : i] = val === X ? barrier : val ? {id:String(index),value:Number(val)} : null
  })
  return Object.freeze(board.map(row=>Object.freeze(row)))
}
for (const direction of ['left','right','up','down'] as const) {
  test.each([
    [[0,4,X,4],[4,0,X,4],0],
    [[X,2,2,0],[X,4,0,0],4],
    [[2,2,X,4],[4,0,X,4],4],
    [[2,X,X,2],[2,X,X,2],0],
  ] as const)('segmented '+direction+' %j', (input, expected, score) => {
    const initial = fixture(input,direction)
    const move = moveBoard(initial,direction)
    const values = (board:typeof move.board) => board.flat().map(c => c && ('kind' in c ? X : c.value))
    expect(values(move.board)).toEqual(values(fixture(expected,direction)))
    expect(move.score).toBe(score)
    initial.forEach((row,r)=>row.forEach((c,i)=>{if(c===barrier) expect(move.board[r]![i]).toBe(c)}))
    if (input.every((v,i)=>v===expected[i])) expect(move.board).toBe(initial)
  })
}
test('level opening with a fixed obstacle can feed the same movement kernel', () => {
  const state = enterLevel(createRandomSnapshot(9), {obstacles:[[2,2]],skillTiles:[],protocolTiles:[]},()=>false)
  for (const dir of ['up','right','down','left'] as const) {
    expect(moveBoard(state.board,dir).board[2]![2]).toBe(state.board[2]![2])
  }
})
