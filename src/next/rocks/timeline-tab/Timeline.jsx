import React from 'react'
import Controls from './Controls'
import Keylines from './Keylines'
import Timebar from './timebar/Timebar'
import Toolbar from './Toolbar'
import DividerLine from './DividerLine'
import customDrag from 'custom-drag'

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

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Timeline extends React.Component {
  constructor() {
    super()

    this.state = {
      dividerPos: 300,
      width: 2000
    }
  }

  static defaultProps = {
    headHeight: 21
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
        <Toolbar timeline={timeline} style={{width: dividerPos}}/>
        <Timebar timeline={timeline} height={headHeight}/>
      </div>
      <div style={{display: 'flex', flex: 1}}>
        <Controls timeline={timeline} style={{width: dividerPos}}/>
        <Keylines timeline={timeline}/>
      </div>
      <DividerLine ref={dragRef} position={dividerPos}/>
    </div>
  }
}
