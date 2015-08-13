import React from 'react'
import ControlPoint from './ControlPoint'

export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    store: React.PropTypes.object,
    timeline: React.PropTypes.object,
  }

  componentDidMount() {
    const {timeline, store} = this.props
    timeline.on('change', () => this.forceUpdate())
    store.on('change', () => this.forceUpdate())
  }

  renderControlPoint(pointName, spaceX, spaceY) {
    const {initialEase, controlledEases} = this.props.store
    const x = initialEase[`point${pointName}X`]
    const y = initialEase[`point${pointName}Y`]

    return <ControlPoint
      {...{x, y, spaceX, spaceY}}
      onChange = {({x, y}) => {
        console.log(x, y)
        controlledEases.forEach(ease => {
          ease[`point${pointName}X`] = x
          ease[`point${pointName}Y`] = y
        })
      }}/>
  }

  renderPath(w, h) {
    const {
      pointAX: pax,
      pointBY: pay,
      pointBX: pbx,
      pointBY: pby,
    } = this.props.store.initialEase

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
    const {timeline, store} = this.props

    if (!store.isFocused) {
      return <div hidden/>
    }

    const {top, height, startTime, endTime, initialEase} = store
    const left = timeline.convertTimeToPosition(startTime)
    const right = timeline.convertTimeToPosition(endTime)
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
