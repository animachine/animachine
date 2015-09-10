import reducer from './reducer'
import actions from './actions'

BETON.define({
  id: 'project-manager',
  dependencies: ['store', 'project-manager', 'workspace'],
  init
})

function init({store, projectManager, workspace}) {
  store.addReducer(reducer)

  return {
    reducer,
    actions,
    focusItem: itemId => focusItem(projectManager, workspace, itemId)
  }
}
