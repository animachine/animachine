import React from 'react'
import Controls from './Controls'
import Keylines from './Keylines'

export default class Timeline extends React.Component {
  constructor() {
    super()

    this.state = {
      dividerPos: 300,
      width: 2000
    }
  }

  componentDidMount() {
    this.testOwnSize()
    setInterval(this.testOwnSize, 321)
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
    const {timeline} = this.props
    const {width} = this.state

    return <div style={{display: 'flex', width, height: '100%'}}>
      <div style={{width: dividerPos}}>
        <Controls timeline={timeline}/>
      </div>
      <div style={{flex: 1}}>
        <Keylines timeline={timeline}/>
      </div>
      <div ref='divider'/>
    </div>
  }
}
