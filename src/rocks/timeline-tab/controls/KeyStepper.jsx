import React from 'react'
import {Button} from 'react-matterkit'
import {observable} from 'mobservable'
import {observer} from 'mobservable-react'

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

    const {state} = BETON.require('project-manager')
    const keyTimes = this.keyHolder.keyTimes
    const timeline = state.selectedTimeline
    this.hasKeyBefore = observable(() =>
      keyTimes[0] < timeline.currentTime
    )
    this.hasKeyAfter = observable(() =>
      timeline.currentTime < keyTimes[keyTimes.length - 1]
    )
    this.hasKeyNow = observable(() =>
      keyTimes.indexOf(timeline.currentTime) !== -1
    )
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
    const keyTimes = this.keyHolder.keyTimes
    let time
    for (let i = 1; i < keyTimes.length; ++i) {
      if (keyTimes[i] > currentTime) {
        time = next ? keyTimes[i] : keyTimes[-1]
      }
    }
    actions.set(state.selectedTimeline, 'currentTime', time)
  }

  render() {
    return <div
      style = {{position: 'relative'}}
      onMouseEnter = {() => this.setState({hover: true})}
      onMouseLeave = {() => this.setState({hover: false})}>

      {this.hasKeyBefore && <Button
        icon = 'angle-left'
        style = {{...stepperStyle, left: -stepperW}}
        onClick = {() => {this.handleStepTime(false)}}/>
      }

      {this.hasKeyAfter && <Button
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
