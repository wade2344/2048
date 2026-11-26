import { createApp, defineComponent, h, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { adventureNodes } from '@infinite/game-config'
import { createRandomSnapshot, legalSlides, slideClassic, slideOrdinaryNode, startClassic, startOrdinaryNode, type Direction, type OrdinaryNodeState } from '@infinite/game-engine'
import './style.css'
import { playFeedback } from './feedback'

const keys: Record<string, Direction> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
}

function newSeed() {
  const seed = new Uint32Array(1)
  crypto.getRandomValues(seed)
  return seed[0]!
}

createApp(defineComponent({
  setup() {
    const classic = shallowRef(startClassic(newSeed()))
    const node = adventureNodes[0]
    const adventure = shallowRef<OrdinaryNodeState>()
    const mode = shallowRef<'classic' | 'adventure'>('classic')
    function newAdventure() {
      return startOrdinaryNode(createRandomSnapshot(newSeed()), node.goal,
        { obstacles: [], skillTiles: [], protocolTiles: [] })
    }
    function changeMode(next: typeof mode.value) {
      clearFeedback()
      if (next === 'adventure') adventure.value ??= newAdventure()
      mode.value = next
    }
    function restart() {
      clearFeedback()
      if (mode.value === 'classic') classic.value = startClassic(newSeed())
      else adventure.value = newAdventure()
    }
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
      if (mode.value === 'classic' ? classic.value.ended : adventure.value?.cleared) return
      if (playback) {
        queued ??= direction
        return
      }
      let events
      if (mode.value === 'adventure' && adventure.value) {
        const move = slideOrdinaryNode(adventure.value, direction)
        if (!move.accepted) return
        adventure.value = move.state
        events = move.events
      } else {
        const move = slideClassic(classic.value, direction)
        if (!move.accepted) return
        classic.value = move.state
        events = move.events
      }
      if (!grid.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const active = playFeedback(grid.value, events)
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
    return () => {
      const current = mode.value === 'adventure' ? adventure.value : undefined
      const ended = current ? !current.cleared && legalSlides(current.board).length === 0 : classic.value.ended
      const board = current?.board ?? classic.value.board
      return h('section', { class: 'console' }, [
      h('header', [h('h1', ['2048', h('small','INFINITE')]), h('button', {
        onClick: restart,
      }, '重新开始')]),
      h('nav', { 'aria-label':'游戏模式' }, [
        h('button', { 'aria-pressed':mode.value === 'classic', onClick:() => changeMode('classic') }, '经典模式'),
        h('button', { 'aria-pressed':!!current, onClick:() => changeMode('adventure') }, '冒险首关'),
      ]),
      current && h('h2', node.name + ' · 合成 ' + node.goal.target),
      h('section', {class:'stats', 'aria-label':'对局统计'}, [
        h('div',[h('span','运算分数'), h('strong', {id:'score'}, current?.nodeScore ?? classic.value.score)]),
        h('div',[h('span','有效移动'), h('strong', {id:'moves'}, current?.validMoves ?? classic.value.actions.length)]),
        current && h('div',[h('span','能量'), h('strong',{id:'energy'}, current.energy + '/' + current.energyRules.capacity)]),
      ]),
      h('div', {ref:grid, class:'board', role:'group', 'aria-label':current ? '冒险运算矩阵' : '经典运算矩阵',
        onPointerdown:press, onPointerup:release,
        onPointercancel:(e: PointerEvent) => { if (gesture?.id === e.pointerId) gesture = undefined },
      }, board.flatMap((row,r) => row.map((tile,c) => {
        const value = tile && 'kind' in tile ? '障碍' : tile?.value
        return h('div', {key:r*4+c, class:'cell', 'data-value':value ?? 0,
          'aria-label':`第${r+1}行第${c+1}列，${value ?? '空'}`}, value ?? '') }))),
      h('p',{role:'status'},current?.cleared ? '核心启动完成 · 首关已通关' : ended ? '核心崩溃 · 已无可移动方向' : '滑动棋盘或按方向键，合并相同数字。'),
    ])
    }
  },
})).mount('#app')
