import state from './state'

export const COLLAPSE = '@workspace/COLLAPSE'
export const UNCOLLAPSE = '@workspace/UNCOLLAPSE'
export const MOVE = '@workspace/MOVE'


export function collapse() {
  state.collapsed = true
}

export function uncollapse() {
  state.collapsed = false
}

export function move({x, y}) {
  state.launchButtonX = x
  state.launchButtonY = y
}
