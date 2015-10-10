import React from 'react'
import {Provider} from 'react-redux'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'item-settings-dialog',
  dependencies: ['store', 'project-manager', 'workspace'],
  init
})

function init({store, projectManager, workspace}) {
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
