import { createApp, defineComponent, h, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { slideClassic, startClassic, type Direction } from '@infinite/game-engine'
import './style.css'
import { playFeedback } from './feedback'

const keys: Record<string, Direction> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
}

function newGame() {
  const seed = new Uint32Array(1)
  crypto.getRandomValues(seed)
  return startClassic(seed[0]!)
}

createApp(defineComponent({
  setup() {
    const state = shallowRef(newGame())
    let gesture: { id: number; x: number; y: number } | undefined

    const grid = shallowRef<HTMLElement>()
    let playback: ReturnType<typeof playFeedback> | undefined
    let queued: Direction | undefined
    function clearFeedback() {
      queued = undefined
      playback?.cancel()
      playback = undefined
      gesture = undefined
    }
    function slide(direction: Direction) {
      if (state.value.ended) return
      if (playback) {
        queued ??= direction
        return
      }
      const move = slideClassic(state.value, direction)
      if (!move.accepted) return
      state.value = move.state
      if (!grid.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const active = playFeedback(grid.value, move.events)
      playback = active
      void active.finished.then(() => {
        if (playback !== active) return
        playback = undefined
        const direction = queued
        queued = undefined
        if (direction) slide(direction)
      })
    }
    function keydown(event: KeyboardEvent) {
      const direction = keys[event.key]
      if (!direction || event.ctrlKey || event.altKey || event.metaKey) return
      event.preventDefault()
      slide(direction)
    }
    function press(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0) return
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }
    function release(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return
      const dx = event.clientX - gesture.x
      const dy = event.clientY - gesture.y
      gesture = undefined
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
      slide(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
    }
    onMounted(() => window.addEventListener('keydown', keydown))
    onBeforeUnmount(() => { clearFeedback(); window.removeEventListener('keydown', keydown) })
    return () => h('section', { class: 'console' }, [
      h('header', [h('h1', ['2048', h('small','INFINITE')]), h('button', {
        onClick: () => { clearFeedback(); state.value = newGame() },
      }, '重新开始')]),
      h('section', {class:'stats', 'aria-label':'对局统计'}, [
        h('div',[h('span','运算分数'), h('strong', {id:'score'}, state.value.score)]),
        h('div',[h('span','有效移动'), h('strong', {id:'moves'}, state.value.actions.length)]),
      ]),
      h('div', {ref:grid, class:'board', role:'group', 'aria-label':'经典运算矩阵',
        onPointerdown:press, onPointerup:release,
        onPointercancel:(e: PointerEvent) => { if (gesture?.id === e.pointerId) gesture = undefined },
      }, state.value.board.flatMap((row,r) => row.map((tile,c) =>
        h('div', {key:r*4+c, class:'cell', 'data-value':tile?.value ?? 0,
          'aria-label':`第${r+1}行第${c+1}列，${tile?.value ?? '空'}`}, tile?.value ?? '')))),
      h('p',{role:'status'},state.value.ended ? '核心崩溃 · 已无可移动方向' : '滑动棋盘或按方向键，合并相同数字。'),
    ])
  },
})).mount('#app')
