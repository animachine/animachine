import React from 'react'
import ControlPoint from './ControlPoint'
import {convertTimeToPosition} from '../utils'
import ClickAway from 'react-matterkit/lib/utils/ClickAway'

//@ClickAway
export default class InlineEaseEditor extends React.Component {
  static propTypes = {
    timeline: React.PropTypes.object,
    actions: React.PropTypes.object,
    selectors: React.PropTypes.object,
  }

  handleClickAway() {
    const {actions, timeline} = this.props
    actions.setInlineEaseEditorOfTimeline({
      timelineId: timeline.id,
      inlineEaseEditor: false,
    })
  }

  getControlEase() {
    const {timeline, selectors} = this.props

    return selectors.getItemById({
      id: timeline.inlineEaseEditor.controlEaseId
    })
  }

  renderControlPoint(pointName, spaceX, spaceY) {
    const {timeline, actions} = this.props
    const {controlledEaseIds} = timeline.inlineEaseEditor
    const controlEase = this.getControlEase()
    const x = controlEase[`point${pointName}X`]
    const y = controlEase[`point${pointName}Y`]

    return <ControlPoint
      {...{x, y, spaceX, spaceY}}
      onChange = {({x, y}) => {
        console.log(x, y)
        controlledEaseIds.forEach(easeId => {
          actions[`setPoint${pointName}XOfEase`]({
            easeId,
            [`point${pointName}X`]: x
          })
          actions[`setPoint${pointName}YOfEase`]({
            easeId,
            [`point${pointName}Y`]: y
          })
        })
      }}/>
  }

  renderPath(w, h) {
    const {
      pointAX: pax,
      pointAY: pay,
      pointBX: pbx,
      pointBY: pby,
    } = this.getControlEase()

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

    if (!inlineEaseEditor) {
      return <div hidden/>
    }

    const {top, height, startTime, endTime} = inlineEaseEditor
    const left = convertTimeToPosition({timeline, time: startTime})
    const right = convertTimeToPosition({timeline, time: endTime})
    const width = right - left
    const rootStyle = {
      position: 'absolute',
      left,
      top: top + height,
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
