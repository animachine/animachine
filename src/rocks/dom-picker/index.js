import React from 'react'
import DOMPicker from './DOMPicker'
import state from './state'
import * as actions from './actions'
import {HotKeys} from 'react-hotkeys'

BETON.define({
  id: 'dom-picker',
  dependencies: ['workspace', 'generate-selector'],
  init: ({workspace}) => {

    const hotkeyMap = {
      'cancel': ['esc']
    }
    const hotkeyHandlers = {
      cancel: () => console.log('canceled')
    }

    workspace.overlays.setOverlay('dom-picker', {
      index: 110,
      getElement: () => {
        return <HotKeys keyMap={hotkeyMap} handlers={hotkeyHandlers}>
          <DOMPicker/>
        </HotKeys>
      }
    })

    return {
      state,
      actions,
    }
  }
})
