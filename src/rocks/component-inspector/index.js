import * as selectors from './selectors'
import * as actions from './actions'
import reducer from './reducer'


BETON.define({
  id: 'component-inspector',
  dependencies: ['store'],
  init: ({store}) => {
    store.addReducer('componentInspector', reducer)
    connectToComponents()

    return {
      selectors,
      actions,
    }

    function connectToComponents() {
      global._registerMountedAnimachineComponent = component => {
        actions.registerComponent({component})
      }

      if (global._waitingMountedAnimachineComponents) {
        global._waitingMountedAnimachineComponents.forEach(component => {
          actions.registerComponent({component})
        })
        delete global._waitingMountedAnimachineComponents
      }
    }
  }
})
