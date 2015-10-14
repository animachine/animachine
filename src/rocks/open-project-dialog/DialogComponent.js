import React from 'react'
import JsonVision from 'json-vision'
import {DialogComp} from 'spaceman'
import {Scrollable, Tabs} from 'react-matterkit'
import Markdown from 'react-remarkable'

const URL_REACT_ANIMACHINE_ENHANCER = 'https://github.com/azazdeaz/react-animachine-enhancer'

export default class DialogComponent extends React.Component {
  renderNoComponentContent() {
    return <Markdown>
      ###Can't find any animatable component
      You have to decorate your components with [react-animachine-enhancer]({URL_REACT_ANIMACHINE_ENHANCER}) to animate them with animachine.
      Check out [its readme](URL_REACT_ANIMACHINE_ENHANCER) for more info about this.
    </Markdown>
  }

  renderTabs({selected, inspectedComponents, projectSources}) {
    return <Tabs defaultTabIdx={selected === 'open' ? 0 : 1} style={{flex: 1}}>
      <div label='Open'>
        {this.renderOpenProjectContent({projectSources})}
      </div>
      <div label='New'>
        {this.renderNewProjectContent({inspectedComponents})}
      </div>
    </Tabs>
  }

  renderOpenProjectContent({projectSources}) {
    const settings = [
      {
        selector: 'root',
        hiddenHead: true,
      }, {
        selector: connect => !!connect.value.timelines,
        label: connect => connect.value.name,
        buttons: [{
          label: 'open',
          mod: {kind: 'colored'},
          onClick: connect => {
            const projectSource = connect.value
            const {
              getMountedComponentsOfProjectSource
            } = BETON.getRock('component-inspector').selectors
            const previewComponents =
              getMountedComponentsOfProjectSource({projectSource})
            const {openProject} = BETON.getRock('project-manager').actions
            openProject({projectSource, previewComponents})
            this.props.onClose()
          }
        }],
        children: null
      }
    ]
    return <JsonVision value={projectSources} settings={settings}/>
  }

  renderNewProjectContent() {
    const PROJECT_NAME = Symbol()
    const TIMELINE_NAME = Symbol()
    const OPEN = Symbol()
    let projectName = 'new project'
    let timelineName = 'new timeline'
    const settings = [
      {
        selector: 'root',
        hiddenHead: true,
      }, {
        selector: {value: PROJECT_NAME},
        label: 'project name',
        input: {
          value: connect => projectName,
          onChange: (value, connect) => {
            projectName = value
            connect.reportChange()
          }
        },
      }, {
        selector: {value: TIMELINE_NAME},
        label: 'timeline name',
        input: {
          value: connect => timelineName,
          onChange: (value, connect) => {
            timelineName = value
            connect.reportChange()
          }
        },
      }, {
        selector: {value: OPEN},
        label: null,
        buttons: [{
          label: 'create and open',
          mod: {kind: 'colored'},
          onClick: () => {
            const projectSource = {
              name: projectName,
              timelines: [{
                name: timelineName
              }]
            }
            const {
              getInspectedComponents
            } = BETON.getRock('component-inspector').selectors
            const previewComponents = getInspectedComponents()
            const {openProject} = BETON.getRock('project-manager').actions
            openProject({projectSource, previewComponents})
            this.props.onClose()
          }
        }]
      }
    ]
    return <JsonVision value={[PROJECT_NAME, TIMELINE_NAME, OPEN]} settings={settings}/>
  }

  render() {
    const {selected, onClose} = this.props
    const {
      getInspectedComponents,
      getProjectSources,
    } = BETON.getRock('component-inspector').selectors
    const inspectedComponents = getInspectedComponents()
    const projectSources = getProjectSources()

    return <DialogComp
        title = 'Item settigns'
        buttons = {[]}
        onClose = {onClose}>
      <Scrollable style={{display: 'flex', width: 432, height: 453}}>
        {inspectedComponents.length === 0
          ? this.renderNoComponentContent()
          : this.renderTabs({selected, inspectedComponents, projectSources})
        }
      </Scrollable>
    </DialogComp>
  }
}
