import React from 'react'
import customDrag from 'custom-drag'
import {getTheme} from 'react-matterkit'

const dragOptions = {
  onDown(props, monitor) {
    monitor.setData({
      initX: props.x,
      initY: props.y
    })
  },
  onDrag(props, monitor) {
    const {spaceX, spaceY, onChange} = props
    const {initX, initY} = monitor.data
    const difference = monitor.getDifferenceFromInitialOffset()

    onChange({
      x: initX + (difference.x / spaceX),
      y: initY - (difference.y / spaceY),
    })
  },
  onEnter(props, monitor, component) {
    component.setState({hover: true})
  },
  onLeave(props, monitor, component) {
    component.setState({hover: false})
  },
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class InlineEaseEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hover: false}
  }
  render() {
    const {x, y, spaceX, spaceY, dragRef} = this.props
    const r = 4
    const colors = getTheme(this).getStyle('colors')

    const style = {
      position: 'absolute',
      left: x * spaceX,
      top: y * spaceY,
      cursor: 'grab',
      boxSizing: 'border-box',
      width: r*2,
      height: r*2,
      transform: `translate(-${r}px,-${r}px)`,
      borderRadius: r,
      background: this.state.hover ? colors.white : colors.blue,
      pointerEvents: 'auto',
    }

    return <div style={style} ref={dragRef}/>
  }
}
