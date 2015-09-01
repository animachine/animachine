import {
  ADD_TOOLBAR_ITEM
} from './actions'

const initialState = []

export default function (toolbar = initialState, action) {
  switch (action.type) {
    case ADD_TOOLBAR_ITEM:
      return [
        ...toolbar,
        action.item
      ]
    default:
      return toolbar
  }
}
