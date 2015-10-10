export const COLLAPSE = '@workspace/COLLAPSE'
export const UNCOLLAPSE = '@workspace/UNCOLLAPSE'
export const MOVE = '@workspace/MOVE'

function dispatch(action) {
  const store = BETON.getRock('store')
  store.dispatch(action)
}

export function collapse() {
  dispatch({type: COLLAPSE})
}

export function uncollapse() {
  dispatch({type: UNCOLLAPSE})
}

export function move({x, y}) {
  dispatch({type: MOVE, x, y})
}
