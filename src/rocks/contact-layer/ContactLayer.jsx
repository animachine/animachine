import React from 'react'

export default class ContactLayer extends React.Component {
  render() {
    return <div
      onClick = {this.props.onPick}
      style = {{
        width: '100%',
        pointerEvents: 'auto',
        backgroundColor: 'rgba(222,222,222,0)',
      }}/>
  }
}
