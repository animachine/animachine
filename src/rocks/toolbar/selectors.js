export function getToolbar() {
  const store = BETON.getRock('store')
  return store.getState().toolbar
}
