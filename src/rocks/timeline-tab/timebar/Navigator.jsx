import React, {PropTypes} from 'react'
import {observer} from 'mobservable-react'
import customDrag from 'custom-drag'
import {getVisibleTime} from '../utils'
import {getTheme} from 'react-matterkit'

const getDragArgs = (dragMode) => {
  const options = {
    onDown(props, monitor) {
      const {start, pxpms} = props.timeline
      const visibleTime = getVisibleTime({timeline: props.timeline})
      monitor.setData({start, visibleTime, pxpms})
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
        const {currentTime, pxpms} = timeline
        let visibleTime = initial.visibleTime + move
        actions.setVisibleTimeOfTimeline({timelineId, visibleTime})

        let mdPos = (initial.start + currentTime) * initial.pxpms
        actions.setStartOfTimeline({
          timelineId,
          start: -((currentTime * pxpms) - mdPos) / pxpms
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
@observer
export default class Pointer extends React.Component {
  // static propTypes = {
  //   timeline: PropTypes.shape({
  //     start: PropTypes.number,
  //     pxpms: PropTypes.number,
  //     width: PropTypes.number,
  //     lenght: PropTypes.number,
  //     startMargin: PropTypes.number,
  //   })
  // }
  // shouldComponentUpdate(next) {
  //   const {props} = this
  //   return (
  //     props.timeline.start !== next.timeline.start ||
  //     props.timeline.pxpms !== next.timeline.pxpms ||
  //     props.timeline.width !== next.timeline.width ||
  //     props.timeline.length !== next.timeline.length ||
  //     props.timeline.startMargin !== next.timeline.startMargin
  //   )
  // }
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
  }

  renderHandler(side, ref) {
    const colors = getTheme(this).getStyle('colors')
    const style = {
      position: 'absolute',
      [side === 'start' ? 'left' : 'right']: '0px',
      top: '0px',
      height: '100%',
      width: '8%',
      minWidth: '1px',
      maxWidth: '7px',
      cursor: 'ew-resize',
      backgroundColor: this.state.hover === side ? colors.blue : 'transparent'
    }

    return <div ref={ref} style={style}/>
  }

  render() {
    const {timeline, startDragger, endDragger, moveDragger} = this.props
    const colors = getTheme(this).getStyle('colors')
    const {hover} = this.state
    const {start, length, width, startMargin} = timeline
    const visibleTime = getVisibleTime({timeline})
    const scale = width / length
    const styleContainer = {
      left: ((-start * scale) + startMargin) + 'px',
      width: (visibleTime * scale) + 'px',
      position: 'absolute',
      top: '0px',
      height: '7px',
      cursor: 'move',
      transformOrigin: 'center top',
      transform: `scaleY(${hover ? 1 : 0.56})`,
      backgroundColor: hover ? colors.grey2 : colors.grey3,
    }
    const stylePointer = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      transformOrigin: 'center top',
      backgroundColor: hover === 'move' ? colors.blue : 'transparent'
    }

    return <div style={styleContainer}>
      <div ref={moveDragger} style={stylePointer}/>
      {this.renderHandler('start', startDragger)}
      {this.renderHandler('end', endDragger)}
    </div>
  }
}
