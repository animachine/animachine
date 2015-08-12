import React from 'react'
import {Button} from 'react-matterkit'

export default class KeyStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  handleKeyClick = () => {
    const hasKeyNow = this.hasKeyNow()
    const {param, timeline} = this.props
    const time = timeline.currentTime

    if (param.getParamsLength() > 0) {
      param.forEachParam(childParam => {
        toggle(childParam)
      })
    }
    else {
      toggle(param)
    }

    function toggle(param) {
      if (hasKeyNow) {
        let key = param.getKeyBy('time', time)
        param.removeKey(key)
      }
      else {
        let value = param.getValueAtTime(time)
        let key = param.demandKeyLike({time})
        key.value = param.getValueAtTime(time)
      }
    }
  }

  hasKeyNow() {
    const {param, timeline} = this.props
    const time = timeline.currentTime

    if (param.getParamsLength() > 0) {
      let allHas = true
      param.forEachParam(childParam => {
        if (!childParam.findKeyBy('time', time)) {
          allHas = false
        }
      })
      return allHas
    }
    else {
      return param.findKeyBy('time', time)
    }
  }

  render() {
    const {param, timeline, style} = this.props
    const time = timeline.currentTime
    const {hover} = this.state
    const hasKeyNow = this.hasKeyNow()
    const previousKey = param.findPreviousKey(time)
    const nextKey = param.findNextKey(time)
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
