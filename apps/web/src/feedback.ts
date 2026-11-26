import type { slideClassic } from '@infinite/game-engine'

type MoveEvents = Extract<ReturnType<typeof slideClassic>, { accepted: true }>['events']

/** Capture the previous grid before Vue paints the committed state. */
export function playFeedback(grid: HTMLElement, events: MoveEvents) {
  const cells = Array.from(grid.querySelectorAll<HTMLElement>('.cell'))
  const animations: Animation[] = []
  const ghosts: HTMLElement[] = []
  const movingDestinations = new Set<HTMLElement>()
  const merged = new Set<HTMLElement>()
  const origin = grid.getBoundingClientRect()
  for (const event of events) {
    if (event.type === 'TILE_MOVED') {
      const source = cells[event.from[0] * 4 + event.from[1]]!
      const target = cells[event.to[0] * 4 + event.to[1]]!
      const from = source.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      const ghost = source.cloneNode(true) as HTMLElement
      ghost.classList.replace('cell','ghost')
      ghost.dataset.tileId = event.id
      ghost.setAttribute('aria-hidden','true')
      Object.assign(ghost.style, {left: from.left-origin.left-grid.clientLeft+'px',
        top: from.top-origin.top-grid.clientTop+'px',width:from.width+'px',height:from.height+'px'})
      grid.append(ghost)
      ghosts.push(ghost)
      movingDestinations.add(target)
      animations.push(ghost.animate([{transform:'translate(0,0)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px)`}],
        {duration:120,easing:'ease-out'}))
    } else if (event.type === 'TILE_MERGED') {
      merged.add(cells[event.to[0]*4+event.to[1]]!)
    } else {
      animations.push(cells[event.row*4+event.col]!.animate([{opacity:0,transform:'scale(.75)'},{opacity:1,transform:'scale(1)'}],
        {duration:120,delay:120,fill:'backwards'}))
    }
  }
  for (const target of movingDestinations) {
    const frames = merged.has(target) ? [{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'scale(1.09)',offset:.65},{opacity:1,transform:'scale(1)'}] : [{opacity:1},{opacity:1}]
    animations.push(target.animate([{opacity:0,offset:0},{opacity:0,offset:.5},...frames.map((frame,i)=>({...frame,offset:.51+.49*i/(frames.length-1)}))],{duration:240}))
  }
  const clear = () => { for (const ghost of ghosts) ghost.remove() }
  const finished = Promise.allSettled(animations.map(a => a.finished)).then(clear)
  return { finished, cancel() { for (const a of animations) a.cancel(); clear() } }
}
