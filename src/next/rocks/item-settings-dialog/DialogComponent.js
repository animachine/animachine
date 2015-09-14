import React from 'react'
import JsonVision from 'json-vision'
import {DialogComp} from 'spaceman'
import treeSettings from './treeSettings'
import itemSettings from './itemSettings'

export default class DialogComponent extends React.Component {
  render() {
    const {items, lastSelectedItemId, actions, onClose} = this.props
    const selectedItem = items.find(item => lastSelectedItemId === item.id)
    console.log({selectedItem, lastSelectedItemId})

    return <DialogComp
        title = 'Item settigns'
        buttons = {[{label: 'close', onClick: 'close'}]}
        onClose = {onClose}>
      <div style={{display: 'flex', width: 432}}>
        <JsonVision
          settings={treeSettings}
          value={items}
          style={{flex: 1}}
        />
      <JsonVision
          settings={itemSettings}
          value={selectedItem}
          style={{flex: 1}}
        />
      </div>
    </DialogComp>
  }
}
