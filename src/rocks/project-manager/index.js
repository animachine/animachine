import * as actions from './actions/actions'
import reducer from './reducer'
import State from './State'

BETON.define({
  id: 'project-manager',
  dependencies: [],
  init: () => {
    const state = new State()
    return {state, actions}
  }
})
