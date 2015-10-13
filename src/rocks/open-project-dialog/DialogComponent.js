import React from 'react'
import {connect} from 'react-redux'
import JsonVision from 'json-vision'
import {DialogComp} from 'spaceman'
import treeSettings from './treeSettings'
import itemSettings from './itemSettings'
import {Scrollable, Tabs} from 'react-matterkit'
import Markdown from 'react-remarkable'

const URL_REACT_ANIMACHINE_ENHANCER = 'https://github.com/azazdeaz/react-animachine-enhancer'

@connect(() => {
  const projectManager = BETON.getRock('project-manager')
  const pmStore = projectManager.selectors.getProjectManager()
  const {items, lastSelectedItemId} = pmStore
  return {
    lastSelectedItemId,
    items,
    actions: projectManager.actions,
  }
})

export default class DialogComponent extends React.Component {
  renderNoComponentContent() {
    return <Markdown>
      ###Can't find any animatable component
      You have to decorate your components with [react-animachine-enhancer]({URL_REACT_ANIMACHINE_ENHANCER}) to animate them with animachine.
      Check out [its readme](URL_REACT_ANIMACHINE_ENHANCER) for more info about this.
    </Markdown>
  }

  renderTabs(selected, children) {
    return <Tabs currTabIdx={selected === 'open' ? 0 : 1}>
      <div label = 'Open'>
        {this.renderOpenProjectContent()}
      </div>
      <div label = 'New'>
        {this.renderNewProjectContent()}
      </div>
    </Tabs>
  }

  renderOpenProjectContent() {

  }

  renderNewProjectContent() {

  }

  render() {
    const {items, lastSelectedItemId, actions, onClose} = this.props
    const selectedItem = items.find(item => lastSelectedItemId === item.id)
    console.log({selectedItem, lastSelectedItemId})

    return <DialogComp
        title = 'Item settigns'
        buttons = {[{label: 'close', onClick: onClose}]}
        onClose = {onClose}>
      <Scrollable style={{display: 'flex', width: 432, height: 453}}>
        <JsonVision
          settings={treeSettings}
          value={{}}
          style={{flex: 1}}
        />
        <JsonVision
          settings={itemSettings}
          value={selectedItem}
          style={{flex: 1}}
        />
      </Scrollable>
    </DialogComp>
  }
}
