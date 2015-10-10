import React from 'react'
import JsonVision from 'json-vision'
import controlsSettings from './controlsSettings'

export default class Controls extends React.Component {
  constructor() {
    super()
    BETON.getRock('config', config => this.config = config)
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.timeline.isPlaying
  }

  render() {
    const {timeline, style} = this.props
    return <JsonVision
      style = {style}
      settings = {controlsSettings}
      value = {timeline}/>
  }
}
