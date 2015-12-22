import * as actions from './actions/actions'
import * as getters from './getters'
import state from './state'

BETON.define({
  id: 'project-manager',
  dependencies: [],
  init: () => {
    return {state, actions, getters}
  }
})
