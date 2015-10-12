import React from 'react'
import {Button, Input} from 'react-matterkit'
import {DialogComp} from 'spaceman'
import ReactZeroClipboard from 'react-zeroclipboard'
import download from './download'

export default class Dialog extends React.Component {
  renderCopyButton = () => {
    const {source, fileName, onClose} = this.props

    return <ReactZeroClipboard
      text = {source}
      onAfterCopy = {onClose}>
      <Button label='copy' style={{height: 32, lineHeight: '32px'}}/>
    </ReactZeroClipboard>
  }

  renderDownloadButton = () => {
    const {source, fileName, onClose} = this.props
    const uri = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(source)
    return <Button
      onClick = {() => {
        download({fileName, uri})
        onClose()
      }}
      label='download'
      style={{height: 32, lineHeight: '32px'}}/>
  }

  render() {
    return <DialogComp
      onClose = {this.props.onClose}
      title = 'Save'
      buttons = {[
        {getElement: this.renderCopyButton},
        {getElement: this.renderDownloadButton}
      ]}>
      Download the file or copy to clipboard. (Save to filesystem feature is under development)
    </DialogComp>
  }
}
