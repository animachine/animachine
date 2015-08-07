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
    const {spaceY, spaceY, onChange} = props
    const {initX, initY} = monitor.data
    const difference = monitor.getDifferenceFromInitialOffset()
    onChange({
      x: initX + (difference.x / sapceX),
      y: initY + (difference.y / sapceY),
    })
  }
}

export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    store: React.PropTypes.object,
    timelineTab: React.PropTypes.object,
  }

  render() {
    const {x, y, spaceX, spaceY} = this.props

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

    return <div style={style} ref={ref}/>
  }
}
