import React from 'react'
import customDrag from 'custom-drag'
import {Button} from 'react-matterkit'

const dragOptions = {
  onDown(props, monitor) {
    monitor.setData({
      initX: props.x,
      initY: props.y,
    })
  },
  onDrag(props, monitor) {
    const {x, y} = monitor.getDifferenceFromInitialOffset()
    props.move({
      x: monitor.data.initX + x,
      y: monitor.data.initY + y,
    })
  },
  onClick(props) {
    props.uncollapse()
  }
}
@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class LaunchButton extends React.Component {
  render() {
    const {x, y, dragRef} = this.props
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
