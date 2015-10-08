import React from 'react'

export default class ContactLayer extends React.Component {
  render() {
    return <div
      onClick = {this.props.onPick}
      style = {{width: '100%', height: '100%', background: 'red'}}/>
  }
}
