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
  (state, props) => ({
    timeline: projectManager.selectors.combineTimeline(props.timelineId)
  }),
  () => ({
    actions: projectManager.actions
  })
)
@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Timeline extends React.Component {
  static propTypes = {
    timeline: PropTypes.object.isRequired,
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

    this.props.timeline.on('change', () => this.forceUpdate())
  }

  testOwnSize = () => {
    const {width} = React.findDOMNode(this).getBoundingClientRect()

    if (width !== this.state.fullWidth) {
      this.props.timeline.width = width - this.state.dividerPos
      this.setState({fullWidth: width})
    }
  }

  render() {
    const {dividerPos} = this.state
    const {timeline, headHeight, dragRef} = this.props
    const {fullWidth} = this.state
    const rootStyle = {
      display: 'flex',
      flexDirection: 'column',
      width: fullWidth,
      // height: '100%'
    }

    return <div style={rootStyle}>
      <div style={{display: 'flex', height: headHeight}}>
        <Toolbar {...{timeline, actions}} style={{width: dividerPos}}/>
        <Timebar {...{timeline, actions}} height={headHeight}/>
      </div>
      <div style={{display: 'flex', flex: 1}}>
        <Controls {...{timeline, actions}} style={{width: dividerPos}}/>
        <Keylines {...{timeline, actions}}/>
      </div>
      <DividerLine ref={dragRef} position={dividerPos}/>
    </div>
  }
}
