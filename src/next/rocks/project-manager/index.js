import * as selectors from './selectors'
import actions from './actions'
import reducer from './reducer'

global.actions = actions

BETON.define({
  id: 'project-manager',
  dependencies: ['store'],
  init: ({store}) => {
    store.addReducer('projectManager', reducer)
    return {selectors, actions}
  }
})
