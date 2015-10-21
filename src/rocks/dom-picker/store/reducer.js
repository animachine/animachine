import {
  SET_PICKED_DOM_NODE
} from './actions'

const initialState = null

export default function (pickedDOMNode = initialState, action) {
  switch (action.type) {
    case SET_PICKED_DOM_NODE:
      return action.pickedDOMNode
    default:
      return pickedDOMNode
  }
}
