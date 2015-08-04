import React from 'react'
import Controls from './Controls'
import Keylines from './Keylines'
import Timebar from './timebar/Timebar'

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
    const {timeline, headHeight} = this.props
    const {width} = this.state
    const styleSide = {
      display: 'flex',
      position: 'relative',
      flexDirection: 'column',
    }

    return <div style={{display: 'flex', width, height: '100%'}}>
      <div style={{width: dividerPos, ...styleSide}}>
        <div style={{height: headHeight}}/>
        <Controls timeline={timeline}/>
      </div>
      <div style={{flex: 1, ...styleSide}}>
        <Timebar timeline={timeline} height={headHeight}/>
        <Keylines timeline={timeline}/>
      </div>
      <div ref='divider'/>
    </div>
  }
}
