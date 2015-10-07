import * as selectors from './selectors'
import * as actions from './actions'
import reducer from './reducer'
console.log('QQQQQQQQQQQQQQQQactions', actions)
BETON.define({
  id: 'project-manager',
  dependencies: ['store'],
  init: ({store}) => {
    store.addReducer('projectManager', reducer)
    return {selectors, actions}
  }
})
