import React from 'react'
import Timeline from './Timeline'

export default class TimelineTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    BETON.getRock('project-manager', projectManager => {
      this.projectManager = projectManager
      const currentProject = projectManager.getCurrentProject()
      currentProject.model.on('change.currentTimeline', this.refreshTimeline)
      this.refreshTimeline()
    })
  }

  refreshTimeline = () => {
    const currentProject = this.projectManager.getCurrentProject()
    const timeline = currentProject.model.getCurrentTimeline()

    this.setState({timeline})
  }

  render() {
    const {timeline} = this.state
    return timeline ?
      <Timeline timeline={timeline} key={timeline.modelId}/> :
      <div hidden>mount</div>
  }
}
