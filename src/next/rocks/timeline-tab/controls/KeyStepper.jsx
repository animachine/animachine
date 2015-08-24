import React from 'react'
import {Button} from 'react-matterkit'

export default class KeyStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleKeyClick = () => {
    const {param, timeline} = this.props
    this.props.toggleKeys({param, timeline})
  }

  forEachEndParam(callback) {
    function handle(item) {
      if (item.type === 'track') {
        item.params.forEach(handle)
      }
      else if (item.type === 'param') {
        if (item.params.length) {
          item.params.forEach(handle)
        }
        else {
          callback(param)
        }
      }
    }

    handle(this.props.keyHolder)
  }

  forEachKey(callback) {
    this.forEachEndParam(param => {
      param.keys.forEach(callback)
    })
  }

  findNextKey() {
    const {currentTime} = this.props.timeline
    let result
    this.forEachKeys(key => {
      if (key.time > currentTime) {
        if (!result || result.time > key.time) {
          result = time
        }
      }
    })
    return result
  }

  findPreviewKey() {
    const {currentTime} = this.props.timeline
    let result
    this.forEachKeys(key => {
      if (key.time < currentTime) {
        if (!result || result.time < key.time) {
          result = time
        }
      }
    })
    return result
  }

  hasKeyNow() {
    const {currentTime} = this.props.timeline
    let allHaveKey = true
    this.forEachEndParam(param => {
      if (!param.keys.find(key => key.time === currentTime)) {
        allHaveKey = false
      }
    })
    return allHaveKey
  }

  render() {
    return <div hidden/>
    const {param, timeline, style} = this.props
    const {hover} = this.state
    const hasKeyNow = this.hasKeyNow()
    const previousKey = this.findPreviousKey()
    const nextKey = this.findNextKey()
    const stepperW = 9
    const stepperStyle = {
      position: 'absolute',
      top: 0,
      cursor: 'pointer',
    }
    return <div
      style = {{position: 'relative'}}
      onMouseEnter = {() => this.setState({hover: true})}
      onMouseLeave = {() => this.setState({hover: false})}>

      {hover && previousKey && <Button
        icon = 'angle-left'
        style = {{...stepperStyle, left: -stepperW}}
        onClick = {() => {timeline.currentTime = previousKey.time}}/>
      }

      {hover && nextKey && <Button
        icon = 'angle-right'
        style = {{...stepperStyle, right: -stepperW}}
        onClick = {() => {timeline.currentTime = nextKey.time}}/>
      }

      <Button
        icon = 'key'
        style = {{opacity: hasKeyNow ? 1 : 0.4}}
        onClick = {this.handleKeyClick}/>
    </div>
  }
}
