import React from 'react'
import Dialog from './Dialog'

BETON.define({
  id: 'file-save',
  dependencies: [
    'toolbar',
    'project-manager',
    'workspace',
    'create-source-file'
  ],
  init
})

function init({toolbar, projectManager, workspace, createSourceFile}) {
  toolbar.actions.addItemToToolbar({
    item: {
      icon: 'save',
      onClick: showSaveDialog,
    }
  })

  function showSaveDialog() {
    workspace.dialogs.showDialog({
      getElement: () => {
        return <Dialog {...createSourceFile()}/>
      }
    })
  }
}
