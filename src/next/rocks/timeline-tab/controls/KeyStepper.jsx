import React from 'react'
import {Button} from 'react-matterkit'

export default class KeyStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleKeyClick = () => {
    const {actions} = BETON.getRock('project-manager')
    const {keyHolderId, timeline} = this.props
    actions.toggleKeysAtTime({keyHolderId, time: timeline.currentTime})
  }

  render() {
    const {selectors, actions} = BETON.getRock('project-manager')
    const {keyHolderId, timeline, style} = this.props
    const {hover} = this.state
    const time = timeline.currentTime
    const hasKeyNow = selectors.getKeysAtTime({keyHolderId, time})
    const previousKey = selectors.getPreviousKey({keyHolderId, time})
    const nextKey = selectors.getNextKey({keyHolderId, time})
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
        onClick = {() => {actions.setCurrentTimeOfTimeline({
          timelineId: timeline.id,
          currentTime: previousKey.time
        })}}/>
      }

      {hover && nextKey && <Button
        icon = 'angle-right'
        style = {{...stepperStyle, right: -stepperW}}
        onClick = {() => {actions.setCurrentTimeOfTimeline({
          timelineId: timeline.id,
          currentTime: nextKey.time
        })}}/>
      }

      <Button
        icon = 'key'
        style = {{opacity: hasKeyNow ? 1 : 0.4}}
        onClick = {this.handleKeyClick}/>
    </div>
  }
}
