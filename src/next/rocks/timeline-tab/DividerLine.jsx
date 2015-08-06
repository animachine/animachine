import React from 'react'

export default class DividerLine extends React.Component {
  static propTypes = {
    position: 0
  }

  render() {
    const style = {
      position: 'absolute',
      left: this.props.position,
      top: 0,
      width: 1,
      height: '100%',
      transform: 'translateX(1px) scaleX(3)',
      cursor: 'ew-resize',
    }

    return <div style={style}/>
  }
}
