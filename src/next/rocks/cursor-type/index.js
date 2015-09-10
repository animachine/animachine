import * as selectors from './selectors'
import * as actions from './actions'
import * as types from './types'
import reducer from './reducer'


BETON.define({
  id: 'cursor-type',
  dependencies: ['store'],
  init: ({store}) => {
    store.addReducer('cursorType', reducer)

    return {
      selectors,
      actions,
      types,
    }
  }
})
