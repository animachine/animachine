import * as selectors from './selectors'
import actions from './actions'
import reducer from './reducer'

BETON.define('project-manager', ['store'], (store) => {
  store.addReducer('projectManager', reducer)
  return {selectors, actions}
})
