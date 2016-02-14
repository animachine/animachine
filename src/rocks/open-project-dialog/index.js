import React from 'react'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'open-project-dialog',
  dependencies: ['project-manager', 'workspace'],
  init
})

function init({projectManager, workspace}) {
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
