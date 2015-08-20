import React from 'react'
import customDrag from 'custom-drag'

const getDragArgs = (dragMode) => {
  const options = {
    onDown(props, monitor) {
      const {start, visibleTime, timescale} = props.timeline
      monitor.setData({start, visibleTime, timescale})
    },
    onDrag(props, monitor) {
      const {timeline, actions} = props
      const timelineId = timeline.id
      const {x: xInit} = monitor.getInitialClientOffset()
      const {x: xNow} = monitor.getClientOffset()
      const scale = timeline.width / timeline.length
      const move = (xNow - xInit) / scale
      const initial = monitor.data
      const start = initial.start - move

      if (dragMode === 'move') {
        actions.setStartOfTimeline({timelineId, start})
      }
      else if (dragMode === 'start') {
        let visibleTime = initial.visibleTime - move
        actions.setStartOfTimeline({timelineId, start})
        actions.setVisibleTimeOfTimeline({timelineId, visibleTime})
      }
      else if (dragMode === 'end') {
        let visibleTime = initial.visibleTime + move
        actions.setVisibleTimeOfTimeline({timelineId, visibleTime})

        let mdPos = (initial.start + timeline.currentTime) * initial.timescale
        actions.setStartOfTimeline({
          timelineId,
          start: -((timeline.currentTime * timeline.timescale) - mdPos) / timeline.timescale
        })
      }
    },
    onEnter(props, monitor, component) {
      component.setState({hover: dragMode})
    },
    onLeave(props, monitor, component) {
      component.setState({hover: false})
    }
  }

  const connect = (connect) => ({
    [`${dragMode}Dragger`]: connect.getDragRef()
  })

  return [options, connect]
}

@customDrag(...getDragArgs('move'))
@customDrag(...getDragArgs('start'))
@customDrag(...getDragArgs('end'))
export default class Pointer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  static defaultProps = {
    radius: 5,
    position: 0,
  }

  renderHandler(side, ref) {
    const style = {
      position: 'absolute',
      [side === 'start' ? 'left' : 'right']: '0px',
      top: '0px',
      height: '100%',
      width: '8%',
      minWidth: '1px',
      maxWidth: '7px',
      cursor: 'ew-resize',
      backgroundColor: this.state.hover === side ? 'white' : 'transparent'
    }

    return <div ref={ref} style={style}/>
  }

  render() {
    const {timeline, startDragger, endDragger, moveDragger} = this.props
    const {hover} = this.state
    const {start, length, visibleTime, width, startMargin} = timeline
    const scale = width / length
    const styleContainer = {
      left: ((-start * scale) + startMargin) + 'px',
      width: (visibleTime * scale) + 'px',
      position: 'absolute',
      top: '0px',
      height: '7px',
      cursor: 'move',
      transform: `scaleY(${hover ? 1 : 0.4})`,
      backgroundColor: hover ? 'red' : 'blue',
    }
    const stylePointer = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      transformOrigin: 'center top',
      backgroundColor: hover === 'move' ? 'white' : 'transparent'
    }

    return <div style={styleContainer}>
      <div ref={moveDragger} style={stylePointer}/>
      {this.renderHandler('start', startDragger)}
      {this.renderHandler('end', endDragger)}
    </div>
  }
}
