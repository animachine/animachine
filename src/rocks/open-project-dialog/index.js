import React from 'react'
import {Provider} from 'react-redux'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'open-project-dialog',
  dependencies: ['store', 'project-manager', 'workspace'],
  init
})

function init({store, projectManager, workspace}) {
  function show(selected) {
    workspace.dialogs.show({
      getElement({onClose}) {
        return <Provider store={store}>
          <DialogComponent selected={selected} onClose={onClose}/>
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
