import React, { PropTypes } from 'react'
import {observer} from 'mobservable-react'
import {createEaser} from 'animachine-connect'
import {convertTimeToPosition} from '../utils'

@observer
export default class Ease extends React.Component {
  render () {
    const {beforeKey, afterKey, height, colors} = this.props
    const easer = createEaser(afterKey.ease)
    const timeline = afterKey.parentTimeline
    const startPosition = convertTimeToPosition(timeline, beforeKey.time)
    const endPosition = convertTimeToPosition(timeline, afterKey.time)
    const width = endPosition - startPosition

    if (width === 0) {
      return <g hidden/>
    }

    let points = ''
    for (let i = 0; i < width; ++i) {
      const x = startPosition + i
      const y = height - height * easer.getRatio(i/width)
      points += `${x},${y}`
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
