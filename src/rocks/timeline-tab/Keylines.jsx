import React from 'react'
import Keyline from './Keyline'
import {convertTimeToPosition} from './utils'
import {ContextMenu} from 'react-matterkit'

export default class Keylines extends React.Component {
  shouldComponentUpdate() {
    return !this.props.timeline.isPlaying
  }

  renderPointerLine({height}) {
    const {timeline} = this.props
    const position = convertTimeToPosition({
      timeline,
      time: timeline.currentTime
    })
    const style = {
      position: 'absolute',
      transform: `translate(${position}px)`,
      left: 0,
      top: 0,
      width: 1,
      height,
      backgroundColor: '#FF4136',
    }
    return <div style={style}/>
  }

  render() {
    const {timeline, actions, selectors, style} = this.props
    const height = BETON.require('config').size
    const children = []
    var pos = 0

    const renderKeyline = model => {
      children.push(<Keyline
        {...{timeline, actions, selectors}}
        top = {pos}
        style = {{left: 0, top: pos}}
        height = {height}
        model = {model}
        key = {model.id}/>)

      pos += height

      if (model.openInTimeline && model.params) {
        model.params.forEach(param => renderKeyline(param))
      }
    }

    timeline.tracks.forEach((param, idx) => renderKeyline(param))

    const menuItems = [
      {label: 'delete selected keys', onClick: () => {
        const {actions} = BETON.require('project-manager')
        actions.removeSelectedKeysOfTimeline({timelineId: timeline.id})
      }}
    ]

    return <ContextMenu items={menuItems}>
      <div style={{...style, position: 'relative'}}>
        {children}
        {this.renderPointerLine({height: pos})}
      </div>
    </ContextMenu>
  }
}
