import React, {PropTypes} from 'react'
import Controls from './controls/Controls'
import Keylines from './Keylines'
import Timebar from './timebar/Timebar'
import Toolbar from './Toolbar'
import DividerLine from './DividerLine'
import customDrag from 'custom-drag'
import {connect} from 'react-redux'

const projectManager = BETON.getRock('project-manager')

const dragOptions = {
  onDown(props, monitor, component) {
    monitor.setData({
      initDividerPos: component.state.dividerPos
    })
  },
  onDrag(props, monitor, component) {
    const dividerPos = monitor.getDifferenceFromInitialOffset().x
    component.setState({dividerPos})
  }
}

@connect(
  (state) => {
    const projectManager = BETON.getRock('project-manager')
    const {getCurrentTimelineId} = projectManager.selectors
    const timelineId = getCurrentTimelineId()
    if (!timelineId) {
      return {}
    }
    const timeline = projectManager.selectors.combineTimeline(timelineId)
    return {timeline}
  },
  () => {
    const projectManager = BETON.getRock('project-manager')
    return {
      actions: projectManager.actions,
      selectors: projectManager.selectors,
    }
  }
)
@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Timeline extends React.Component {
  static propTypes = {
    timeline: PropTypes.object,
    headHeight: PropTypes.number,
  }

  static defaultProps = {
    headHeight: 21
  }

  constructor(props) {
    super(props)
    this.state = {
      dividerPos: 300,
      fullWidth: 2000
    }
  }

  componentDidMount() {
    this.testOwnSize()
    setInterval(this.testOwnSize, 321)
  }

  testOwnSize = () => {
    const {width} = React.findDOMNode(this).getBoundingClientRect()
    const {dividerPos, fullWidth} = this.state
    const {timeline} = this.props
    const {setWidthOfTimeline} = this.props.actions

    if (width !== fullWidth) {
      this.setState({width: fullWidth})
    }

    const timelineWidth = width - dividerPos
    if (timeline && timeline.width !== timelineWidth) {
      console.log({timelineWidth, timeline})
      setWidthOfTimeline({
        timelineId: timeline.id,
        width: timelineWidth
      })
    }
  }

  render() {
    const {dividerPos, fullWidth} = this.state
    const {timeline, actions, selectors, headHeight, dragRef} = this.props
    const rootStyle = {
      display: 'flex',
      flexDirection: 'column',
      width: fullWidth,
      // height: '100%'
    }

    if (!timeline) {
      return <div hidden/>
    }

    const commonProps = {timeline, actions, selectors}

    return <div style={rootStyle}>
      <div style={{display: 'flex', height: headHeight}}>
        <Toolbar {...commonProps} style={{width: dividerPos}}/>
        <Timebar {...commonProps} height={headHeight}/>
      </div>
      <div style={{display: 'flex', flex: 1}}>
        <Controls {...commonProps} style={{width: dividerPos}}/>
        <Keylines {...commonProps}/>
      </div>
      <DividerLine ref={dragRef} position={dividerPos}/>
    </div>
  }
}
