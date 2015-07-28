import React from 'react'

export default Timeline extends React.Component {
  constructor() {
    super()

    this.state = {
      dividerPos: 300,
      width: null
    }
  }

  componentDidMount() {
    this.canvas = React.findDOMNode(this)
    this.ctx = canvas.getContext('2d')
  }

  componentDidUpdate() {
    this.postRender()
  }

  testOwnSize() {
    const {width} = React.findDOMNode(this).getBoundingClientRect()

    if (width !== this.state.fillWidth) {
      this.state.timelne.width = width - this.state.dividerPos
      this.setState({fillWidth: width})
    }
  }

  render() {
    const {dividerPos} = this.state
    const {width, height, style, timeline} = this.props

    return <div style={{display: 'flex', width, height: '100%'}}>
      <div style={{width: dividerPos}}>
        <Controls timeline={timeline}/>
      </div>
      <div style={{flex: 1}}>
        <Keylines timeline={timeline}/>
      </div>
      <Divider/>
    </div>
  }
}
