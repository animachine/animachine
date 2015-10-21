import React from 'react'
import {Provider} from 'react-redux'
import DOMPicker from './DOMPicker'
import reducer from './store/reducer'
import actions from './store/actions'
import selectors from './store/selectors'

BETON.define({
  id: 'transform-tool',
  dependencies: ['workspace', 'store'],
  init: ({workspace, store}) => {
    console.log({workspace})
    workspace.overlays.setOverlay('transform-tool', {
      index: 100,
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
