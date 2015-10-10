import * as selectors from './selectors'
import * as actions from './actions'
import reducer from './reducer'


BETON.define({
  id: 'toolbar',
  dependencies: ['store'],
  init: ({store}) => {
    store.addReducer('toolbar', reducer)

    return {
      selectors,
      actions,
    }
  }
})
