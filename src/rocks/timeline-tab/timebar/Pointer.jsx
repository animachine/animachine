import React, {PropTypes} from 'react'
import {afflatus} from 'afflatus'
import {getVisibleTime} from '../utils'

@afflatus
export default class Pointer extends React.Component {
  // static propTypes = {
  //   timeline: PropTypes.shape({
  //     start: PropTypes.number,
  //     pxpms: PropTypes.number,
  //     width: PropTypes.number,
  //     currentTime: PropTypes.number,
  //   }),
  //   radius: PropTypes.number,
  //   position: PropTypes.number,
  // }
  static defaultProps = {
    radius: 5,
    position: 0,
  }

  render() {
    const {radius, timeline} = this.props
    const {start, currentTime, width} = timeline
    const visibleTime = getVisibleTime(timeline)
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
