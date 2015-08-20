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

  render() {
    return <div hidden/>
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
