import React from 'react'
import {Panel} from 'react-matterkit'


export default class OverlayPanel extends React.Component {
  render () {
    return (
      <Panel style={{
        position: 'absolute',
        zIndex: 200,
        boxShadow: '0px 0px 5px 0px rgba(255,255,255,0.5)',//'0px 0px 5px 0px rgba(107,182,196,0.75)',
      }}>
        {this.props.children}
      </Panel>
    )
  }
}
