const store = BETON.require('store')

export const SET_PICKED_DOM_NODE = 'SET_PICKED_DOM_NODE'
export function registerComponent({cursorType}) {
  store.dispatch({
    type: SET_PICKED_DOM_NODE,
    cursorType,
  })
}
