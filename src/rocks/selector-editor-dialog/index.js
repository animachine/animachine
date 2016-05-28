import React from 'react'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'selector-editor-dialog',
  dependencies: ['project-manager', 'workspace'],
  init
})

function init({projectManager, workspace}) {
  return {
    show(track) {
      workspace.dialogs.show({
        getElement({onClose}) {
          return <DialogComponent track={track} onClose={onClose}/>
        }
      })
    }
  }
}
