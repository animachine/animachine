import React, { PropTypes } from 'react'
import {afflatus} from 'afflatus'
import {convertTimeToPosition} from '../utils'

@afflatus
export default class Ease extends React.Component {
  render () {
    const {ease, height, colors} = this.props
    const easer = ease.easer
    const timeline = ease.parentTimeline
    const keyTimes = ease.parentParam.keyTimes
    const endTime = ease.parentKey.time
    const startTime = keyTimes[keyTimes.indexOf(endTime) - 1]
    const startPosition = convertTimeToPosition(timeline, startTime)
    const endPosition = convertTimeToPosition(timeline, endTime)
    const width = endPosition - startPosition

    if (width === 0) {
      return <g hidden/>
    }

    let points = ''
    for (let i = 0; i < width; ++i) {
      const x = startPosition + i
      const y = height - height * easer.getRatio(i/width)
      points += `${x},${y} `
    }

    const style = {
      fill: 'none',
      stroke: colors.ease,
      strokeWidth: 1.2
    }

    return (
      <polyline
        points = {points}
        style = {style}/>
    )
  }
}
