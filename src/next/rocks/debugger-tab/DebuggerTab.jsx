import React from 'react'
import JsonVison from 'json-vision'

export default class DebuggerTab extends React.Component {
  render() {
    const {settings, value} = this.props
    return <JsonVison settings={settings} value={value}/>
  }
}
