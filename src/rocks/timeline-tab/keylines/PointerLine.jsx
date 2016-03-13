import React, { PropTypes } from 'react'
import {afflatus} from 'afflatus'
import {convertTimeToPosition} from '../utils'

@afflatus
export default class Ease extends React.Component {
  render () {
    const {timeline, height} = this.props
    const position = convertTimeToPosition(timeline, timeline.currentTime)
    const style = {
      position: 'absolute',
      transform: `translate(${position}px)`,
      left: 0,
      top: 0,
      width: 1,
      height: 10000,
      backgroundColor: '#FF4136',
    }
    return <div style={style}/>
  }
}
