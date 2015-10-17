import React from 'react'
import {connect} from 'react-redux'
import JsonVision from 'json-vision'
import {DialogComp} from 'spaceman'
import treeSettings from './treeSettings'
import itemSettings from './itemSettings'
import {Scrollable} from 'react-matterkit'

@connect(() => {
  const projectManager = BETON.require('project-manager')
  const pmStore = projectManager.selectors.getProjectManager()
  const {items, lastSelectedItemId} = pmStore
  return {
    lastSelectedItemId,
    items,
    actions: projectManager.actions,
  }
})
export default class DialogComponent extends React.Component {
  render() {
    const {items, lastSelectedItemId, actions, onClose} = this.props
    const selectedItem = items.find(item => lastSelectedItemId === item.id)
    console.log({selectedItem, lastSelectedItemId})

    return <DialogComp
        title = 'Item settigns'
        buttons = {[{label: 'close', onClick: onClose}]}
        onClose = {onClose}>
      <div style = {{display: 'flex', width: 432}}>
      <Scrollable style={{height: 453, flex: 1}}>
        <JsonVision
          settings={treeSettings}
          style={{flex: 1}}
        />
      </Scrollable>
        <JsonVision
          settings={itemSettings}
          value={selectedItem}
          style={{flex: 1}}
        />

      </div>
    </DialogComp>
  }
}
