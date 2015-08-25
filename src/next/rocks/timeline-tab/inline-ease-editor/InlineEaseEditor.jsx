import React from 'react'
import ControlPoint from './ControlPoint'
import {convertTimeToPosition} from '../utils'

export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    timeline: React.PropTypes.object,
    actions: React.PropTypes.object,
    selectors: React.PropTypes.object,
  }

  renderControlPoint(pointName, spaceX, spaceY) {
    const {timeline, actions} = this.props
    const {initialEase, controlledEases} = timeline.inlineEaseEditor
    const x = initialEase[`point${pointName}X`]
    const y = initialEase[`point${pointName}Y`]

    return <ControlPoint
      {...{x, y, spaceX, spaceY}}
      onChange = {({x, y}) => {
        console.log(x, y)
        controlledEases.forEach(ease => {
          const easeId = ease.id
          actions[`setPoint${pointName}XOfEase`]({easeId, [`${pointName}X`]: x})
          actions[`setPoint${pointName}YOfEase`]({easeId, [`${pointName}Y`]: y})
        })
      }}/>
  }

  renderPath(w, h) {
    const {
      pointAX: pax,
      pointBY: pay,
      pointBX: pbx,
      pointBY: pby,
    } = this.props.timeline.inlineEaseEditor.initialEase

    const d = [
      `M${w*pax},${h*pay}`,
      `L0,0`,
      `C${w*pax},${h*pay} ${w*pbx},${h*pby} ${w},${h}`,
      `L${w*pbx},${h*pby}`
    ].join(' ')

    const style = {
      fill: 'none',
      stroke: '#00BFFF',
    }

    return <path {...{d, style}}/>
  }

  render() {
    const {timeline} = this.props
    const {inlineEaseEditor} = timeline

    if (!store.isFocused) {
      return <div hidden/>
    }

    const {top, height, startTime, endTime, initialEase} = inlineEaseEditor
    const left = convertTimeToPosition({timeline, time: startTime})
    const right = convertTimeToPosition({timeline, time: endTime})
    const width = right - left
    const rootStyle = {
      position: 'absolute',
      top,
      transform: 'scaleY(-1)',
      pointerEvents: 'none',
    }
    const rootSvgStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      overflow: 'visible',
    }

    return <div style={rootStyle}>
      <svg style={rootSvgStyle}>
        {this.renderPath(width, height)}
      </svg>
      {this.renderControlPoint('A', width, height)}
      {this.renderControlPoint('B', width, height)}
    </div>
  }
}
