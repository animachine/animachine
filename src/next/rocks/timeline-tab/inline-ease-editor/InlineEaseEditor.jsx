import React from 'react'
import ControlPoint from './ControlPoint'
import InlineEaseEditorStore from './inlineEaseEditorStore'

export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    store: React.PropTypes.object,
    timelineTab: React.PropTypes.object,
  }

  renderControlPoint(pointName, ref) {
    const {mainEase, controlledEases} = this.props
    const x = mainEase[`point${pointName}X`]
    const y = mainEase[`point${pointName}Y`]

    return <ControlPoint
      onChange = {(x, y) => {
        controlledEases.forEach(ease => {
          ease[`point${pointName}X`] = x
          ease[`point${pointName}Y`] = y
        })
      }}/>
  }

  render() {
    const {leftDragRef, rightDragRef} = this.props
    const rootStyle = {
      position: 'absolute',
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
        <path/>
      </svg>
      {this.renderControlPoint(0)}
      {this.renderControlPoint(2)}
    </div>
  }
}
