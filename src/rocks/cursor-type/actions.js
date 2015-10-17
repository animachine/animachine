const store = BETON.require('store')

export const SET_CURSOR_TYPE = 'SET_CURSOR_TYPE'
export function registerComponent({cursorType}) {
  store.dispatch({
    type: SET_CURSOR_TYPE,
    cursorType,
  })
}
