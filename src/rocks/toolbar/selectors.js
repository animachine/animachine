const store = BETON.getRock('store')

export function getToolbar() {
  return store.getState().toolbar
}
