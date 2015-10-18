import React from 'react'
import {getVisibleTime} from '../utils'

export default class Pointer extends React.Component {
  static propTypes = {
    timeline: PropTypes.shape({
      start: PropTypes.number,
      pxpms: PropTypes.number,
      width: PropTypes.number,
      currentTime: PropTypes.number,
    }),
    radius: PropTypes.number,
    position: PropTypes.number,
  }
  static defaultProps = {
    radius: 5,
    position: 0,
  }
  shouldComponentUpdate(next) {
    const {props} = this
    return (
      props.timelnie.start !== next.timeline.start ||
      props.timelnie.pxpms !== next.timeline.pxpms ||
      props.timelnie.width !== next.timeline.width ||
      props.timelnie.currentTime !== next.timeline.currentTime ||
      props.radius !== next.radius ||
      props.position !== next.position  
    )
  }

  render() {
    const {radius, timeline} = this.props
    const {start, currentTime, width} = timeline
    const visibleTime = getVisibleTime({timeline})
    const position = ((start + currentTime) / visibleTime) * width
    const styleContainer = {
      pointerEvents: 'none',
      position: 'absolute',
      bottom: 2*radius + 'px',
      transform: `translate(${position}px)`
    }
    const stylePointer = {
      position: 'absolute',
      boxSizing: 'border-box',
      left: -radius + 'px',
      width: 2*radius + 'px',
      height: 2*radius + 'px',
      border: 'solid #FF4136 1px',
      borderRadius: radius + 'px',
    }
    return <div style={styleContainer}>
      <div style={stylePointer}/>
    </div>
  }
}
