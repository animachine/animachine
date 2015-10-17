const store = BETON.require('store')

export function getCursorType() {
  return store.getState().cursorType
}
