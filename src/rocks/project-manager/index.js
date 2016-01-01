import * as actions from './actions/actions'
import * as getters from './getters'
import State from './State'

BETON.define({
  id: 'project-manager',
  dependencies: [],
  init: () => {
    const state = new State()
    return {state, actions, getters}
  }
})
