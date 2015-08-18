import selectors from './selectors'
import actions from './actions'
import reducer from './reducer'


BETON.define('component-inspector', ['store'], (store) => {
  store.setReducer('componentInspector', reducer)

  connectToComponents()

  return {
    selectors,
    actions,
  }

  function connectToComponents() {
    global._registerMountedAnimachineComponent = registerComponent

    if (global._waitingMountedAnimachineComponents) {
      global._waitingMountedAnimachineComponents.forEach(component => {
        store.dispatch(actions.registerComponent({component}))
      })
      delete global._waitingMountedAnimachineComponents
    }
  }
})
