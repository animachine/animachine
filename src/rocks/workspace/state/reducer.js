import {COLLAPSE, UNCOLLAPSE, MOVE} from './actions'

const defaultState = {
  collapsed: false,
  launchButtonX: 0,
  launchButtonY: 0,
}

export default function (state=defaultState, action) {
  switch (action.type) {
    case COLLAPSE:
      return {
        ...state,
        collapsed: true
      }
    case UNCOLLAPSE:
      return {
        ...state,
        collapsed: false
      }
    case MOVE:
      return {
        ...state,
        launchButtonX: action.x,
        launchButtonY: action.y,
      }
    default:
      return state
  }
}
