import React from 'react'
import customDrag from 'custom-drag'

const getDragArgs = (dragMode) => {
  const options = {
    onDown(props, monitor) {
      const {start, visibleTime, timescale} = props.timeline
      monitor.setData({start, visibleTime, timescale})
    },
    onDrag(props, monitor) {
      const {timeline} = props
      const {x: xInit} = monitor.getInitialClientOffset()
      const {x: xNow} = monitor.getClientOffset()
      const scale = timeline.width / timeline.length
      const move = (xNow - xInit) / scale
      const initial = monitor.data
      const start = initial.start - move

      if (dragMode === 'move') {
        timeline.start = start
      }
      else if (dragMode === 'start') {
        timeline.start = start
        timeline.visibleTime = initial.visibleTime - move
      }
      else if (dragMode === 'end') {
        timeline.visibleTime = initial.visibleTime + move

        let mdPos = (initial.start + timeline.currentTime) * initial.timescale
        timeline.start = -((timeline.currentTime * timeline.timescale) - mdPos) / timeline.timescale
      }
    },
    onEnter(props, monitor, component) {
      console.log('enter', dragMode, component)
      component.setState({hover: dragMode})
    },
    onLeave(props, monitor, component) {
      console.log('leave', dragMode, component)
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

  componentDidMount() {
    this.props.timeline.on([
      'change.start',
      'change.timescale',
      'change.width',
      'change.startMargin',
    ], () => this.forceUpdate())
  }

  shouldComponentUpdate() {
    return false
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
    console.log(hover)
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
