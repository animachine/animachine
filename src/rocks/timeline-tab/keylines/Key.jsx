import React, { PropTypes } from 'react'
import {observer} from 'mobservable-react'
import {createEaser} from 'animachine-connect'
import {convertTimeToPosition} from '../utils'

@observer
export default class Ease extends React.Component {
  render () {
    const {key, height, colors} = this.props
    const r = 2

    if (isGroup) {
      return (
        <circle
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
          stroke = {selected ? colors.selected : colors.normal}
          stroke-width='1'/>
      )
    }
  }
}
