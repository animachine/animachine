import React from 'react'
import {DialogComp} from 'spaceman'

export default class DialogComponent extends React.Component {
  static defaultProps = {
    content: 'Message',
    title: 'Hello!',
    buttons: [{label: 'start', onClick: 'close'}]
  }

  render() {
    const {content, title, buttons, onClose} = this.props

    return <DialogComp
      title = {title}
      buttons = {buttons}
      onClose = {onClose}>
      <div style={{width: 600}}>{content}</div>
    </DialogComp>
  }
}
