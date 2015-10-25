export function getPickedDOMNode() {
  const {getState} = BETON.require('store')
  return getState().pickedDOMNode
}
