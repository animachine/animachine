import React from 'react'
import customDrag from 'custom-drag'
import {Button} from 'react-matterkit'
import state from './state'
import * as actions from './actions'
import {observer} from 'mobservable-react'

const dragOptions = {
  onDown(props, monitor) {
    monitor.setData({
      initX: props.x,
      initY: props.y,
    })
  },
  onDrag(props, monitor) {
    const {x, y} = monitor.getDifferenceFromInitialOffset()
    actions.move({
      x: monitor.data.initX + x,
      y: monitor.data.initY + y,
    })
  },
  onClick(props) {
    actions.uncollapse()
  }
}
@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
@observer
export default class LaunchButton extends React.Component {
  render() {
    const {launchButtonX: x, launchButtonY: y} = state
    const {dragRef} = this.props
    return <Button
      ref = {dragRef}
      tooltip = 'show animachine or drag this button away'
      label = 'animachine'
      style = {{
        pointerEvents: 'auto',
        transform: `translate(${x}px, ${y}px)`
      }}/>
  }
}
