import React from 'react'
import {connect} from 'react-redux'
import {getPickerDOMNode} from 'store/selectors'

@connect(() => ({node: getPickerDOMNode()}))
export default class DomPicker extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
    onChange: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state({hover: false})
  }

  handleMouseEnter = (e) => {
    this.setState({hover: true})
  }

  handleMouseLeave = (e) => {
    this.setState({hover: false})
  }

  render() {
    const {node, onChange} = props
    const buttonSize = 21
    const borderSize = 2
    const baseStyle = {
      position: 'fixed',
      boxSizing: 'border-box',
      display: 'none',
      pointerEvents: 'none',
      border: 'solid #eee ' + borderSize,
      pointerEvents: 'none',
    }
    const dashedStyle = {
      width: '100%',
      height: '100%',
      border: 'dashed #444 ' + borderSize,
      transform: `translate(-${borderSize},-${borderSize})`,
    }
    const buttonContainer = {
      position: 'absolute'
    }

    function selectNode(nextNode) {
      const {actions} = BETON.require('project-manager')

    }

    function renderButton(icon, tooltip, onClick, style) {
      return <Button
        icon = {icon}
        tooltip = {tooltip}
        onClick = {onClick}
        style = {style}/>
    }

    return <div
      style = {baseStyle}
      onMouseEnter = {this.handleMouseEnter}
      onMouseLeave = {this.handleMouseLeave}>
      <div style={dashedStyle}/>
      <div style={buttonContainerStyle} hidden={!this.state.hover}>
        {renderButton(
          'angle-up',
          'up one level',
          () => selectNode(node.parentElement),
          {top: `-${buttonSize}px`, left: 0, right: 0, margin: '0 auto'}
        )}
        {renderButton(
          'angle-right',
          'next sibling',
          () => selectNode(node.nextElementSibling),
          {right: `-${buttonSize}px`, top: 0, bottom: 0, margin: 'auto 0'}
        )}
        {renderButton(
          'angle-down',
          'down one level',
          () => selectNode(node.firstElementChild),
          {bottom: `-${buttonSize}px`, left: 0, right: 0, margin: '0 auto'}
        )}
        {renderButton(
          'angle-left',
          'previous sibling',
          () => selectNode(node.previousElementSibling),
          {left: `-${buttonSize}px`, top: 0, bottom: 0, margin: 'auto 0'}
        )}
        {/*renderButton(
          'cancel',
          'close',
          () => {},
          {right: `-${buttonSize}px`, top: `-${buttonSize}px`}
        )*/}
        {renderButton(
          'plus',
          'create a new track with this node',
          () => {},
          {right: `-${buttonSize}px`, bottom: `-${buttonSize}px`}
        )}
      </div>
    </div>
  }
}
