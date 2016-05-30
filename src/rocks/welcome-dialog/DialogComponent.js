import React from 'react'
import ReactDOM from 'react-dom'
import {DialogComp} from 'spaceman'

export default class DialogComponent extends React.Component {
  static defaultProps = {
    content: 'Message',
    title: 'Hello!',
    buttons: [{label: 'start', onClick: 'close'}]
  }

  componentDidMount() {
    this.hackATagColors()
  }
  componentDidUpdate() {
    this.hackATagColors()
  }

  hackATagColors() {
    const rootNode = ReactDOM.findDOMNode(this)
    Array.prototype.forEach.call(rootNode.querySelectorAll('a'), node => {
      node.style.color = 'rgb(107, 182, 196)'
    })
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
