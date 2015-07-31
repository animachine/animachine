import React from 'react'

export default class Pointer extends React.Component {
  static defaultProps = {
    radius: 5,
    position: 0,
  }

  render() {
    const {radius, timeline} = this.props
    const {start, currentTime, visibleTime, width} = timeline
    const position = ((start + currentTime) / visibleTime) * width
    const styleContainer = {
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
