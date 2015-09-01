import * as selectors from './selectors'
import * as actions from './actions'
import reducer from './reducer'


BETON.define('toolbar', ['store'], (store) => {
  store.addReducer('toolbar', reducer)

  return {
    selectors,
    actions,
  }
})
