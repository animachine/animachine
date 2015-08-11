import React from 'react'
import JsonVison from 'json-vision'
import settings from './settings'

export default class DebuggerTab extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentProject: null
    }
  }

  componentDidMount() {
    BETON.getRock('project-manager', this.setProjectManager)
  }

  setProjectManager = (projectManager) => {
    this.setCurrentProjectNode(projectManager.getCurrentProjectNode())
    projectManager.on('change.currentProjectNode', this.setCurrentProjectNode)
  }

  setCurrentProjectNode(currentProject) {
    if (currentProject) {
      currentProject.model.on('change', () => this.forceUpdate())
    }
    this.setState({currentProject})
  }

  render() {
    const {currentProject} = this.state
    if (!currentProject) {
      return <div hidden/>
    }
    const model = currentProject && currentProject.model || {}
    return <JsonVison style={{overflow:'hidden'}} settings={settings} value={model}/>
  }
}
