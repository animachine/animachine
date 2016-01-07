import React, { PropTypes } from 'react'
import {observer} from 'mobservable-react'
import {createEaser} from 'animachine-connect'
import {convertTimeToPosition} from '../utils'

@observer
export default class Key extends React.Component {
  render () {
    const {_key: key, height, colors, isGroup} = this.props
    const r = 2
    const position = convertTimeToPosition(key.parentTimeline, key.time)

    if (isGroup) {
      return (
        <circle
          fill = {key.selected ? colors.selected : colors.normal}
          cx = {position}
          cy = {height / 2}
          r = {r}/>
      )
    }
    else {
      return (
        <line
          x1 = {position}
          y1 = {0}
          x2 = {position}
          y2 = {height}
          stroke = {key.selected ? colors.selected : colors.normal}
          strokeWidth='1'/>
      )
    }
  }
}
