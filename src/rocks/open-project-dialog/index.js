import React from 'react'
import {Provider} from 'react-redux'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'item-settings-dialog',
  dependencies: ['store', 'project-manager', 'workspace'],
  init
})

function init({store, projectManager, workspace}) {
  function show(type) {
    workspace.dialogs.show({
      getElement({onClose}) {
        return <Provider store={store}>
          <DialogComponent type={type} onClose={onClose}/>
        </Provider>
      }
    })
  }

  return {
    showOpen() {
      show('open')
    },
    showNew() {
      show('new')
    }
  }
}
