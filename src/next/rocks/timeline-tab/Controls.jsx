import React from 'react'
import JsonVision from 'json-vision'
import controlsSettings from './controlsSettings'

export default class Controls extends React.Component {
  constructor() {
    super()
    BETON.getRock('config', config => this.config = config)
  }

  render() {
    const {timeline}  = this.props
    return <JsonVision settigns={controlsSettings} value={timeline}/>
  }
}
