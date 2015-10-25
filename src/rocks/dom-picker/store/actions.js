export const SET_PICKED_DOM_NODE = 'SET_PICKED_DOM_NODE'

export function setPickedDOMNode({pickedDOMNode}) {
  const store = BETON.require('store')

  store.dispatch({
    type: SET_PICKED_DOM_NODE,
    pickedDOMNode,
  })
}
