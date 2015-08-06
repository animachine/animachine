import React from 'react'

export default class DebuggerTab extends React.Component {
  static propTypes = {
    store: React.PropTypes.object,
    timelineTab: React.PropTypes.object,
  }

  renderControlPoint(pointIdx, ref) {
    const {controlledEases} = this.props

    const style = {
      position: 'absolute',
      left: points[pointIdx] * this._width,
      top: points[pointIdx+1] * this._height,
      cursor: 'grab',
      boxSizing: 'border-box',
      width: r*2,
      height: r*2,
      transform: `translate(-${r}px,-${r}px)`,
      borderRadius: r,
      background: '#00BFFF',
      pointerEvents: 'auto',
    }

    return <div style={style} ref={ref}/>

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
