const store = BETON.require('store')

export function getPickerDOMNode() {
  return store.getState().pickedDOMNode
}
