import React from 'react'
import {Provider} from 'react-redux'
import DOMPicker from './DOMPicker'
import reducer from './store/reducer'
import * as actions from './store/actions'
import * as selectors from './store/selectors'

BETON.define({
  id: 'dom-picker',
  dependencies: ['workspace', 'store'],
  init: ({workspace, store}) => {
    store.addReducer('pickedDOMNode', reducer)

    workspace.overlays.setOverlay('dom-picker', {
      index: 110,
      getElement: () => {
        return <Provider store={store}>
          <DOMPicker/>
        </Provider>
      }
    })

    return {
      actions,
      selectors,
    }
  }
})
