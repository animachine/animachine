import React, { PropTypes } from 'react'
import {afflatus} from 'afflatus'
import {convertTimeToPosition} from '../utils'

@afflatus
export default class Ease extends React.Component {
  render () {
    const {ease, height, colors} = this.props
    const easer = ease.easer
    const timeline = ease.parent('Timeline')
    const keyTimes = ease.parent('Param').keyTimes
    const endTime = ease.parent('Key').time
    if (endTime === keyTimes[0]) {//it has no previous key
      return <g hidden/>
    }
    const startTime = keyTimes[keyTimes.indexOf(endTime) - 1]
    const startPosition = timeline.pxpms * startTime
    const endPosition = timeline.pxpms * endTime
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
