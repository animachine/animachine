import {
  ADD_ITEM_TO_TOOLBAR
} from './actions'

const initialState = []

export default function (toolbar = initialState, action) {
  switch (action.type) {
    case ADD_ITEM_TO_TOOLBAR:
      return [
        ...toolbar,
        action.item
      ]
    default:
      return toolbar
  }
}
