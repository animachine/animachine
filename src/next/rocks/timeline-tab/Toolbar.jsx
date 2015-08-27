import React from 'react'
import customDrag from 'custom-drag'
import {Button, Input} from 'react-matterkit'

export default class Toolbar extends React.Component {

  handlePlayPauseClick = () => {
    const {actions, timeline} = this.props

    actions.setIsPlayingOfTimeline({
      timelineId: timeline.id,
      isPlaying: !timeline.isPlaying
    })
  }

  handleTimeInputChange = (time) => {
    const {actions, timeline} = this.props

    actions.setCurrentTimeOfTimeline({
      timelineId: timeline.id,
      currentTime: time
    })
  }

  render() {
    const {timeline, style} = this.props

    return <div style={{...style, display: 'flex'}}>
      <Button
        icon = {timeline.isPlaying ? 'pause' : 'play'}
        onClick = {this.handlePlayPauseClick}/>
      <div style={{flex: 1}}/>
      <Input
        style={{maxWidth: 88}}
        type = 'number'
        value = {timeline.currentTime}
        onChange = {this.handleTimeInputChange}
        prettifyValue = {formatTime}/>
    </div>
  }
}

function formatTime(time) {
  var min, sec, ms, str  = ''

  min = ~~(time / 60000)
  time %= 60000
  sec = ~~(time / 1000)
  time %= 1000
  ms = ~~time

  if (min) {
      str += min + ':'
      sec = ('00' + sec).substr(-2)
  }
  if (sec) {
      str += sec + '.'
      ms = ('000' + ms).substr(-3)
  }
  str += ms
  return str
}
