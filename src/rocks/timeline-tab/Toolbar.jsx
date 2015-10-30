import React from 'react'
import customDrag from 'custom-drag'
import {Button, Input} from 'react-matterkit'
import {connect} from 'react-redux'

@connect(store => {
  const {selectors} = BETON.require('toolbar')
  return {
    toolbar: selectors.getToolbar()
  }
})
export default class Toolbar extends React.Component {
  shouldComponentUpdate() {return false}
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

  renderToolbarItems() {
    return null
    const {toolbar} = this.props
    return toolbar && toolbar.map((toolbarItem, idx) => {
      if (toolbarItem.getElement) {
        return toolbarItem.getElement()
      }
      else {
        const props = {
          key: idx,
          ...toolbarItem,
          mod: {kind: 'stamp', ...toolbarItem.mod}
        }
        return <Button {...props}/>
      }
    })
  }

  render() {
    const {timeline, style} = this.props

    return <div style={{...style, display: 'flex'}}>
      <Button
        mod = {{kind: 'stamp'}}
        icon = {timeline.isPlaying ? 'pause' : 'play'}
        onClick = {this.handlePlayPauseClick}/>
      <Input
        style={{maxWidth: 88}}
        type = 'number'
        value = {timeline.currentTime}
        onChange = {this.handleTimeInputChange}
        prettifyValue = {formatTime}/>
      <div style={{flex: 1}}/>
      {this.renderToolbarItems()}
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
