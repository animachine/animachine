export function getToolbar() {
  const store = BETON.require('store')
  return store.getState().toolbar
}
