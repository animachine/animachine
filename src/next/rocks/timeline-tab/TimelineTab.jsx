import React from 'react'
import Timeline from './Timeline'
import {Provider} from 'react-redux'

export default class TimelineTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    BETON.getRock('project-manager', projectManager => {
      this.projectManager = projectManager
      const currentProject = projectManager.getCurrentProjectNode()
      if (currentProject) {
        currentProject.model.on('change.currentTimeline', this.refreshTimeline)
        this.refreshTimeline()
      }
    })
  }

  refreshTimeline = () => {
    const currentProject = this.projectManager.getCurrentProjectNode()
    const timeline = currentProject.model.getCurrentTimeline()

    this.setState({timeline})
  }

  render() {
    const {timeline} = this.state
    return timeline ?
        (<Provider>
          <Timeline timeline={timeline} key={timeline.modelId}/>
        </Provider>)
        : <div hidden>mount</div>
    // return timeline ?
    //       <Timeline timeline={timeline} key={timeline.modelId}/>
    //     : <div hidden>mount</div>
  }
}
