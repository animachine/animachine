import React from 'react'
import renderControls from './renderControls'
import {ContextMenu, Button, Label} from 'react-matterkit'
import {afflatus} from 'afflatus'

@afflatus
export default class Controls extends React.Component {
  renderPlaceholder() {
    return <div>
      <Label
        style={{marginLeft: 4}}
        label='Hi, there is no track to animate yet!'
      />
      <br/>
      <Button
        label = 'Create a new one!'
        mod = {{kind: 'colored'}}
        onClick = {() => {
          const {timeline} = this.props
          timeline.addTrack({name: 'new track'})
        }}
      />
    </div>
  }

  render() {
    const {timeline} = this.props
    return timeline.tracks.getLength() === 0
      ? this.renderPlaceholder()
      : renderControls(timeline.tracks)
  }
}
