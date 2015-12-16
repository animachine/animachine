import React from 'react'
import {Button} from 'react-matterkit'
import {observable, observer} from 'mobservable'

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
    this.state = {}

    const {state, actions, recursers} = BETON.require('project-manager')

    this.keyTimes = observable(() => {
      const result = []

      recursers.recurseKeys(props.keyHolder, ({time}) => {
        if (result.indexOf(time === -1)) {
          result.push(time)
        }
      })

      return result.sort()
    })
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.skipUpdate
  }

  handleKeyClick = () => {
    const {state, actions} = BETON.require('project-manager')
    const {keyHolder} = this.props
    actions.toggleKeysSelectionAtTime(
      keyHolderId,
      state.selectedTimeline.currentTime
    )
  }

  handleStepTime = (way: boolean) => {
    const {state, actions} = BETON.require('project-manager')
    const keyTimes = this.keyTimes
    let time
    for (let i = 1; i < keyTimes.length; ++i) {
      if (keyTimes[i] > currentTime) {
        time = next ? keyTimes[i] : keyTimes[-1]
      }
    }
    actions.set(state.selectedTimeline, 'currentTime', time)
  }

  render() {
    const {state} = BETON.require('project-manager')
    const timeline = state.selectedTimeline
    let currentTime, hasKeyNow, hasKeyBefore, hasKeyAfter

    if (timeline.isPlaying === false) {
      const keyTimes = this.keyTimes
      hasKeyNow = keyTimes.indexOf(currentTime) !== -1

      if (this.state.hover) {
        hasKeyBefore = keyTimes[0] < currentTime
        hasKeyAfter = currentTime < keyTimes[keyTimes.length - 1]
      }
    }

    return <div
      style = {{position: 'relative'}}
      onMouseEnter = {() => this.setState({hover: true})}
      onMouseLeave = {() => this.setState({hover: false})}>

      {hasKeyBefore && <Button
        icon = 'angle-left'
        style = {{...stepperStyle, left: -stepperW}}
        onClick = {() => {this.handleStepTime(false)}}/>
      }

      {hasKeyAfter && <Button
        icon = 'angle-right'
        style = {{...stepperStyle, right: -stepperW}}
        onClick = {() => this.handleStepTime(true)}/>
      }

      <Button
        icon = 'key'
        style = {{opacity: hasKeyNow ? 1 : 0.4}}
        onClick = {this.handleKeyClick}
        mod = {{kind: 'stamp'}}/>
    </div>
  }
}
