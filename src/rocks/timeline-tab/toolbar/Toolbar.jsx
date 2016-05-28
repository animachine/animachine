import React from 'react'
import {afflatus} from 'afflatus'
import {Button, Input} from 'react-matterkit'
import TimelineName from './TimelineName'
import Menu from './Menu'

@afflatus
class PlayButton extends React.Component {
  render() {
    const {timeline, onClick} = this.props
    return (
      <Button
        mod = {{kind: 'stamp'}}
        icon = {timeline.isPlaying ? 'pause' : 'play'}
        onClick = {onClick}
      />
    )
  }
}

@afflatus
class TimeInput extends React.Component {
  render() {
    const {timeline, onChange} = this.props
    return (
      <Input
        style={{maxWidth: 88}}
        type = 'number'
        value = {timeline.currentTime}
        onChange = {onChange}
        prettifyValue = {formatTime}
      />
    )
  }
}

@afflatus
export default class Toolbar extends React.Component {
  handlePlayPauseClick = () => {
    const {timeline, actions} = this.props
    timeline.isPlaying = !timeline.isPlaying
  }

  handleTimeInputChange = (time) => {
    const {timeline, actions} = this.props
    timeline.currentTime = time
  }

  render() {
    const {timeline, style} = this.props

    return <div style={{...style, display: 'flex'}}>
      <PlayButton
        timeline = {timeline}
        onClick = {this.handlePlayPauseClick}/>
      <TimeInput
        timeline = {timeline}
        onChange = {this.handleTimeInputChange}/>
      <TimelineName/>
      <div style={{flex: 1}}/>
      <Menu/>
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
