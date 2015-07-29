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
    this.setCurrentProject(projectManager.getCurrentProject())
    projectManager.on('change.currentProject', this.setCurrentProject)
  }

  setCurrentProject(currentProject) {
    currentProject.model.on('change', () => this.forceUpdate())
    this.setState({currentProject})
  }

  render() {
    const {currentProject} = this.state
    const model = currentProject && currentProject.model || {}
    return <JsonVison settings={settings} value={model}/>
  }
}
