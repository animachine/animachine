import React from 'react'
import Keyline from './Keyline'
import InlineEaseEditor from './inline-ease-editor/InlineEaseEditor'

export default class Keylines extends React.Component {
  constructor() {
    super()
    BETON.getRock('config', config => this.config = config)
  }

  render() {
    const {timeline}  = this.props
    const height = this.config.size
    const children = []
    var pos = 0

    function renderKeyline(model) {
      children.push(<Keyline
        timeline = {timeline}
        style = {{left: 0, top: pos}}
        height = {height}
        model = {model}
        key = {model.modelId}/>)

      pos += height

      if (model.openInTimeline) {
        model.forEachParam(param => renderKeyline(param))
      }
    }

    timeline.forEachTrack(param => renderKeyline(param))

    return <div style={{position: 'relative', height: pos}}>
      {children}
      <InlineEaseEditor/>
    </div>
  }
}
