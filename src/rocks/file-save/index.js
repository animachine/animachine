import React from 'react'
import Dialog from './Dialog'

BETON.define({
  id: 'file-save',
  dependencies: [
    'toolbar',
    'project-manager',
    'workspace',
    'create-bundle-file'
  ],
  init
})

function init({toolbar, projectManager, workspace, createBundleFile}) {
  toolbar.actions.addItem({
    item: {
      icon: 'save',
      onClick: showSaveDialog,
    }
  })

  function showSaveDialog() {
    workspace.dialogs.showDialog({
      getElement: ({onClose}) => {
        return <Dialog {...createBundleFile()} onClose={onClose}/>
      }
    })
  }
}
