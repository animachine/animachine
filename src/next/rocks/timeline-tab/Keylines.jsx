import React from 'react'
import Keyline from './Keyline'
import InlineEaseEditor from './inline-ease-editor/InlineEaseEditor'
import {convertTimeToPosition} from './utils'

export default class Keylines extends React.Component {
  renderPointerLine() {
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
      height: '100%',
      backgroundColor: '#FF4136',
    }
    return <div style={style}/>
  }

  render() {
    const {timeline, actions}  = this.props
    const height = BETON.getRock('config').size
    const children = []
    var pos = 0

    const renderKeyline = model => {
      children.push(<Keyline
        timeline = {timeline}
        actions = {actions}
        top = {pos}
        style = {{left: 0, top: pos}}
        height = {height}
        model = {model}
        key = {model.modelId}/>)

      pos += height

      if (model.openInTimeline) {
        model.params.forEach(param => renderKeyline(param))
      }
    }

    timeline.tracks.forEach(param => renderKeyline(param))

    return <div style={{position: 'relative'}}>
      {children}
      {this.renderPointerLine()}
      {/*<InlineEaseEditor
        timeline = {timeline}
        store = {this.inlineEaseEditorStore}/>*/}
    </div>
  }
}
