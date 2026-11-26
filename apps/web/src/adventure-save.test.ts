import { expect, test } from 'vitest'
import { legalSlides, slideOrdinaryNode, startFirstNode } from '@infinite/game-engine'
import { encodeFirstNodeSave, decodeFirstNodeSave } from './adventure-save'

test('restores the exact state, seed and accepted moves for continued play', () => {
  const initial = startFirstNode(781)
  const direction = legalSlides(initial.board)[0]!
  const moved = slideOrdinaryNode(initial,direction).state
  expect(decodeFirstNodeSave(encodeFirstNodeSave(moved,781,[direction]))).toEqual({
    state:moved, seed:781, moves:[direction],
  })
})
test('rejects incompatible, truncated or inconsistent snapshots', () => {
  const raw = encodeFirstNodeSave(startFirstNode(0),0,[])
  const altered = JSON.parse(raw)
  altered.state.energy++
  expect(()=>decodeFirstNodeSave(JSON.stringify(altered))).toThrow(/不一致/)
  expect(()=>decodeFirstNodeSave(raw.slice(0,-1))).toThrow()
  expect(()=>decodeFirstNodeSave('{}')).toThrow(/版本/)
})
