import React from 'react'
import ControlPoint from './ControlPoint'
import {convertTimeToPosition} from '../utils'
import ClickAway from 'react-matterkit/lib/utils/ClickAway'

export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    timeline: React.PropTypes.object,
    actions: React.PropTypes.object,
  }

  handleClickAway = () => {
    // const {actions, timeline} = this.props
    // if (timeline.inlineEaseEditor) {
    //   actions.setInlineEaseEditorOfTimeline({
    //     timelineId: timeline.id,
    //     inlineEaseEditor: false,
    //   })
    // }
  }

  renderControlPoint(pointName, spaceX, spaceY) {
    const {timeline, targetKey, actions} = this.props
    const {controlledEaseIds} = timeline.inlineEaseEditor
    const controlEase = targetKey.ease
    const x = controlEase[`point${pointName}X`]
    const y = controlEase[`point${pointName}Y`]

    return <ControlPoint
      {...{x, y, spaceX, spaceY}}
      onChange = {({x, y}) => {
        console.log(x, y)
        controlledEases.forEach(ease => {
          actions.set(ease, `point${pointName}X`, x)
          actions.set(ease, `point${pointName}Y`, y)
        })
      }}/>
  }

  renderPath(w, h) {
    const {
      pointAX: pax,
      pointAY: pay,
      pointBX: pbx,
      pointBY: pby,
    } = this.props.targetKey.ease

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
    const {timeline, dividerPos, scrollPosition, selectors} = this.props
    const {inlineEaseEditor} = timeline

    if (!inlineEaseEditor || !inlineEaseEditor.targetKey) {
      return <div hidden/>
    }
    const {top, height, targetKey} = inlineEaseEditor
    const keyPosition = targetKey.parentParam.keyTimes.indexOf(targetKey.time)
    if (keyPosition === 0) {
      return <div hidden/>
    }
    const previousKeyTime = targetKey.parentParam.keyTimes[keyPosition - 1]
    const startTime = previousKeyTime
    const endTime = targetKey.time
    const left = convertTimeToPosition(timeline, startTime)
    const right = convertTimeToPosition(timeline, endTime)
    const width = right - left

    const rootStyle = {
      position: 'absolute',
      left: left + dividerPos,
      top: (top + height * 2) - scrollPosition,
      transform: 'scaleY(-1)',
      pointerEvents: 'none',
    }
    const rootSvgStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      overflow: 'visible',
    }

    return <ClickAway onClickAway={this.handleClickAway}>
      <div style={rootStyle}>
        <svg style={rootSvgStyle}>
          {this.renderPath(width, height)}
        </svg>
        {this.renderControlPoint('A', width, height)}
        {this.renderControlPoint('B', width, height)}
      </div>
    </ClickAway>
  }
}
