import React, { PropTypes } from 'react'
import {afflatus} from 'afflatus'
import {convertTimeToPosition} from '../utils'

@afflatus
export default class Key extends React.Component {
  render () {
    const {_key: key, height, colors, isGroup} = this.props
    const r = 2
    const position =
      parseInt(key.parent('Timeline').pxpms * key.time) + 0.5

    if (isNaN(position)) debugger

    if (isGroup) {
      return (
        <circle
          fill = {key.selected ? colors.selected : colors.normal}
          cx = {position}
          cy = {height / 2}
          r = {r}
        />
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
