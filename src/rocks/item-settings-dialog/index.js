import React from 'react'
import {Provider} from 'react-redux'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'item-settings-dialog',
  dependencies: ['project-manager', 'workspace'],
  init
})

function init({projectManager, workspace}) {
  return {
    show() {
      workspace.dialogs.show({
        getElement({onClose}) {
          return <Provider store={store}>
            <DialogComponent onClose={onClose}/>
          </Provider>
        }
      })
    }
  }
}
