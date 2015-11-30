import React from 'react'
import {Button} from 'react-matterkit'
import {connect} from 'react-redux'

// export default props => <div>key</div>

@connect((store, props) => {
  const {selectors, actions} = BETON.require('project-manager')
  const {keyHolderId} = props
  const timelineId = selectors.getParentTimelineIdByChildId({childId: keyHolderId})
  const timeline = selectors.getItemById({id: timelineId})
  if (timeline.isPlaying) {
    return {skipUpdate: true}
  }
  const time = timeline.currentTime
  const hasKeyNow = selectors.getKeysAtTime({keyHolderId, time}).length > 0
  const previousKey = selectors.getPreviousKey({keyHolderId, time})
  const nextKey = selectors.getNextKey({keyHolderId, time})
  return {
    hasKeyNow,
    previousKeyTime: previousKey && previousKey.time,
    nextKeyTime: nextKey && nextKey.time,
    timelineId,
    time
  }
})
export default class KeyStepper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.skipUpdate
  }

  handleKeyClick = () => {
    const {actions} = BETON.require('project-manager')
    const {keyHolderId, time} = this.props
    actions.toggleKeysAtTime({keyHolderId, time})
  }

  render() {
    const {actions} = BETON.require('project-manager')
    const {hasKeyNow, previousKeyTime, nextKeyTime, timelineId} = this.props
    const {hover} = this.state
    const stepperW = 12
    const stepperStyle = {
      position: 'absolute',
      top: 0,
      cursor: 'pointer',
      width: 14,
      paddingLeft: 0,
      paddingRight: 0,
    }
    return <div
      style = {{position: 'relative'}}
      onMouseEnter = {() => this.setState({hover: true})}
      onMouseLeave = {() => this.setState({hover: false})}>

      {hover && previousKeyTime !== undefined && <Button
        icon = 'angle-left'
        style = {{...stepperStyle, left: -stepperW}}
        onClick = {() => {actions.setCurrentTimeOfTimeline({
          timelineId,
          currentTime: previousKeyTime
        })}}/>
      }

      {hover && nextKeyTime !== undefined && <Button
        icon = 'angle-right'
        style = {{...stepperStyle, right: -stepperW}}
        onClick = {() => {actions.setCurrentTimeOfTimeline({
          timelineId,
          currentTime: nextKeyTime
        })}}/>
      }

      <Button
        icon = 'key'
        style = {{opacity: hasKeyNow ? 1 : 0.4}}
        onClick = {this.handleKeyClick}
        mod = {{kind: 'stamp'}}/>
    </div>
  }
}
