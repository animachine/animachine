import React from 'react'
import customDrag from 'custom-drag'

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
  }
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    store: React.PropTypes.object,
    timelineTab: React.PropTypes.object,
  }

  render() {
    const {x, y, spaceX, spaceY, dragRef} = this.props
    const r = 3

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
      background: '#00BFFF',
      pointerEvents: 'auto',
    }

    return <div style={style} ref={dragRef}/>
  }
}
