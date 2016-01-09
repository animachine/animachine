import React from 'react'
import {observer} from 'mobservable-react'
import {Button, Input} from 'react-matterkit'

@observer
export default class Toolbar extends React.Component {
  handlePlayPauseClick = () => {
    const {timeline, actions} = this.props
    actions.set(timeline, 'playing', !timeline.playing)
  }

  handleTimeInputChange = (time) => {
    const {timeline, actions} = this.props
    actions.set(timeline, 'currentTime', time)
  }

  renderToolbarItems() {
    const {state: toolbar} = BETON.require('toolbar')
    return toolbar.map((toolbarItem, idx) => {
      if (toolbarItem.getElement) {
        return toolbarItem.getElement()
      }
      else {
        const props = {
          key: idx,
          ...toolbarItem,
          mod: {kind: 'stamp', ...toolbarItem.mod}
        }
        console.log('render item', props)
        return <Button {...props}/>
      }
    })
  }

  render() {
    const {timeline, style} = this.props
    const time = timeline.currentTime

    return <div style={{...style, display: 'flex'}}>
      <Button
        mod = {{kind: 'stamp'}}
        icon = {timeline.isPlaying ? 'pause' : 'play'}
        onClick = {this.handlePlayPauseClick}/>
      <Input
        style={{maxWidth: 88}}
        type = 'number'
        value = {time}
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
