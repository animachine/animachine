import React from 'react'
import Keyline from './Keyline'

export default Keylines extends React.Component {
  constructor() {
    BETON.getRock('config', config => this.config = config)
  }

  render() {
    const {timeline}  = this.props
    const height = this.config.height
    const children = []
    var pos = 0

    function renderKeyline(model) {
      children.push(<Keyline
        style = {left: 0, top: pos}
        model = {model}
        key = {model.modelId}/>)

      pos += height

      if (model.openInTimeline) {
        prop.forEachProp(prop => renderKeyline(prop))
      }
    }

    timeline.forEachTrack(prop => renderKeyline(prop))

    return <div style={{height: pos}}>{children}</div>
  }
}
