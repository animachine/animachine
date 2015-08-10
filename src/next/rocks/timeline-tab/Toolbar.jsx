import React from 'react'
import customDrag from 'custom-drag'
import {Input} from 'react-matterkit'

export default class Toolbar extends React.Component {
  render() {
    const {timeline, style} = this.props

    return <div style = {style}>
      <Input
        type = 'number'
        value = {timeline.currentTime}
        onChange = {value => timeline.currentTime = value}
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
