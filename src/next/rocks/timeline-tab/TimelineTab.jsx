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
    const store = BETON.getRock('store')
    const projectManager = BETON.getRock('project-manager')
    const {getCurrentTimelineId} = projectManager.selectors
    const timelineId = getCurrentTimelineId()
    return timelineId ?
        (<Provider store={store}>
          {() => <Timeline timelineId={timelineId}/>}
        </Provider>)
        : <div hidden>mount</div>
  }
}
