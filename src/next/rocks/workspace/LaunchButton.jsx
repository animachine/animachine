import React from 'react'
import customDrag from 'custom-drag'
import {Button} from 'react-matterkit'

const dragOptions = {
  onClick(props) {
    props.uncollapse()
  }
}
@customDrag(dragOptions)
export default class LaunchButton {
  static childContextTypes = {
    matterkitTheme: React.PropTypes.object
  }

  getChildContext() {
    return {matterkitTheme}
  }

  render() {
    const {x, y} = this.props
    return <Button label='animachine' style={{transform=`translate(${x}px, ${y}px)`}}/>
  }
}
