const store = BETON.getRock('store')

export function getCursorType() {
  return store.getState().cursorType
}
