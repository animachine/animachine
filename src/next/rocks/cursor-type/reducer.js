import {
  SET_CURSOR_TYPE
} from './actions'
import {PICK} from './types'

const initialState = PICK

export default function (cursorType = initialState, action) {
  switch (action.type) {
    case SET_CURSOR_TYPE:
      return action.cursorType
    default:
      return cursorType
  }
}
