import React from 'react'
import {Button} from 'react-matterkit'
import {observable} from 'mobservable'
import {observer} from 'mobservable-react'
import find from 'lodash/collection/find'
import findLast from 'lodash/collection/findLast'

const stepperW = 12
const stepperStyle = {
  position: 'absolute',
  top: 0,
  cursor: 'pointer',
  width: 14,
  paddingLeft: 0,
  paddingRight: 0,
}

@observer
export default class KeyStepper extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hover: false
    }
  }

  @observable get hasKeyBefore() {
    const {state} = BETON.require('project-manager')
    const keyTimes = this.props.keyHolder.keyTimes
    const timeline = state.currentTimeline
    return keyTimes[0] < timeline.currentTime
  }
  @observable get hasKeyAfter() {
    const {state} = BETON.require('project-manager')
    const keyTimes = this.props.keyHolder.keyTimes
    const timeline = state.currentTimeline
    return timeline.currentTime < keyTimes[keyTimes.length - 1]
  }
  @observable get hasKeyNow() {
    const {state} = BETON.require('project-manager')
    const keyTimes = this.props.keyHolder.keyTimes
    const timeline = state.currentTimeline
    return keyTimes.indexOf(timeline.currentTime) !== -1
  }

  handleKeyClick = () => {
    const {state, actions} = BETON.require('project-manager')
    const {keyHolder} = this.props
    actions.toggleKeysAtTime(
      keyHolder,
      state.currentTimeline.currentTime
    )
  }

  handleStepTime = (next: boolean) => {
    const {state, actions} = BETON.require('project-manager')
    const keyTimes = this.props.keyHolder.keyTimes
    const timeline = state.currentTimeline
    const {currentTime} = timeline
    let time = next
      ? find(keyTimes, t => t > currentTime)
      : findLast(keyTimes, t => t < currentTime)
    actions.set(timeline, 'currentTime', time)
  }

  render() {
    const {hover} = this.state

    return <div
      style = {{position: 'relative'}}
      onMouseEnter = {() => this.setState({hover: true})}
      onMouseLeave = {() => this.setState({hover: false})}>

      {hover && this.hasKeyBefore && <Button
        icon = 'angle-left'
        style = {{...stepperStyle, left: -stepperW}}
        onClick = {() => {this.handleStepTime(false)}}/>
      }

      {hover && this.hasKeyAfter && <Button
        icon = 'angle-right'
        style = {{...stepperStyle, right: -stepperW}}
        onClick = {() => this.handleStepTime(true)}/>
      }

      <Button
        icon = 'key'
        style = {{opacity: this.hasKeyNow ? 1 : 0.4}}
        onClick = {this.handleKeyClick}
        mod = {{kind: 'stamp'}}/>
    </div>
  }
}
