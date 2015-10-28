import React from 'react'
import {Provider} from 'react-redux'
import DOMPicker from './DOMPicker'
import reducer from './store/reducer'
import * as actions from './store/actions'
import * as selectors from './store/selectors'
import {HotKeys} from 'react-hotkeys'

BETON.define({
  id: 'dom-picker',
  dependencies: ['workspace', 'store', 'generate-selector'],
  init: ({workspace, store}) => {
    store.addReducer('pickedDOMNode', reducer)

    const hotkeyMap = {
      'cancel': ['esc']
    }
    const hotkeyHandlers = {
      cancel: () => console.log('canceled')
    }

    workspace.overlays.setOverlay('dom-picker', {
      index: 110,
      getElement: () => {
        return <Provider store={store}>
          <HotKeys keyMap={hotkeyMap} handlers={hotkeyHandlers}>
            <DOMPicker/>
          </HotKeys>
        </Provider>
      }
    })

    return {
      actions,
      selectors,
    }
  }
})
