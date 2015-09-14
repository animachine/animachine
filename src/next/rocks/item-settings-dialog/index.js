import React from 'react'
import DialogComponent from './DialogComponent'

BETON.define({
  id: 'item-settings-dialog',
  dependencies: ['store', 'project-manager', 'workspace'],
  init
})

function init({store, projectManager, workspace}) {
  const {items, lastSelectedItemId} = projectManager.selectors.getProjectManager()
  return {
    show() {
      workspace.dialogs.show({
        getElement() {
          return <DialogComponent
            lastSelectedItemId = {lastSelectedItemId}
            items = {items}
            actions = {projectManager.actions}
          />
        }
      })
    }
  }
}
