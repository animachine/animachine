import React from 'react'
import ReactDOM from 'react-dom'
import {Button, Input} from 'react-matterkit'
import {DialogComp} from 'spaceman'
import Clipboard from 'clipboard'
import {saveAs} from 'file-saver'

class CopyButton extends React.Component {
  handleButtonRef = component => {
    if (!component) {
      return
    }
    const {source, onClose} = this.props

    this.clipboard = new Clipboard(ReactDOM.findDOMNode(component), {
      text: () => {
        console.log('copy', source)
        return this.props.source
      }
    })
    this.clipboard.on('success', () => onClose())
  };
  componentWillUnmount() {
    this.clipboard.destroy()
  }
  render() {
    return <Button
      ref={this.handleButtonRef}
      label='copy'
      style={{height: 32, lineHeight: '32px'}}
    />
  }
}

export default class Dialog extends React.Component {
  // renderCopyButton = () => {
  //   const {source, fileName, onClose} = this.props
  //
  //   return <ReactZeroClipboard
  //     text = {source}
  //     onAfterCopy = {onClose}>
  //     <Button label='copy' style={{height: 32, lineHeight: '32px'}}/>
  //   </ReactZeroClipboard>
  // }

  renderDownloadButton = () => {
    const {source, fileName, onClose} = this.props
    const uri = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(source)
    return <Button
      onClick = {() => {
        var blob = new Blob([source], {type: "application/javascript;charset=utf-8"});
        saveAs(blob, fileName);
        onClose()
      }}
      label='download'
      style={{height: 32, lineHeight: '32px'}}/>
  }

  render() {
    const {source, onClose} = this.props

    return <DialogComp
      onClose = {this.props.onClose}
      title = 'Save'
      buttons = {[
        {getElement: () => <CopyButton source={source} onClose={onClose}/>},
        {getElement: this.renderDownloadButton}
      ]}>
      Download the file or copy to clipboard. (Save to filesystem feature is under development)
    </DialogComp>
  }
}
