import React from 'react'
import renderControls from './renderControls'
import {ContextMenu, Button, Label} from 'react-matterkit'

export default class Controls extends React.Component {
  constructor() {
    super()
    BETON.require('config', config => this.config = config)
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.timeline.isPlaying
  }

  renderPlaceholder() {
    return <div>
      <Label label='Hi, there is no track to animate yet!'/>
      <br/>
      <Button
        label = 'Create a new one!'
        mod = {{kind: 'colored'}}
        onClick =  {() => {
          const {actions} = BETON.require('project-manager')
          const timelineId = this.props.timeline.id
          actions.addTrackToTimeline({timelineId, childTrack: {name: 'new Track'}})
        }}/>
    </div>
  }

  render() {
    const {timeline} = this.props
    return timeline.tracks.length === 0
      ? this.renderPlaceholder()
      : renderControls(timeline.tracks)
  }
}
