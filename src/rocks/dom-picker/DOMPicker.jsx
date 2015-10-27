import React from 'react'
import {connect} from 'react-redux'
import {getPickedDOMNode} from './store/selectors'
import {setPickedDOMNode} from './store/actions'
import {Button} from 'react-matterkit'

@connect(() => ({node: getPickedDOMNode()}))
export default class DomPicker extends React.Component {
  static propTypes = {
    node: React.PropTypes.object,
    onChange: React.PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {hover: false}
  }

  handleMouseEnter = (e) => {
    this.setState({hover: true})
  }

  handleMouseLeave = (e) => {
    // this.setState({hover: false})
  }

  addNewTrack(node) {
    const generateSelector = BETON.require('generate-selector')
    const {selectors, actions, normalize} = BETON.require('project-manager')
    const timelineId = selectors.getCurrentTimelineId()
    actions.addTrackToTimeline({
      timelineId,
      name: 'new track',
      childSource: {
        selectors: [generateSelector({node})]
      }
    })
  }

  render() {
    const {node, onChange} = this.props

    if (!node) {
      return <div hidden/>
    }

    const {left, top, width, height} = node.getBoundingClientRect()
    const buttonSize = 21
    const borderSize = 2
    const baseStyle = {
      position: 'fixed',
      left, top, width, height,
      boxSizing: 'border-box',
      pointerEvents: 'none',
      borderStyle: 'solid',
      borderColor: '#eee',
      borderWidth: borderSize,
      pointerEvents: 'auto',
    }
    const dashedStyle = {
      width: '100%',
      height: '100%',
      borderStyle: 'dashed',
      borderColor: '#444',
      borderWidth: borderSize,
      transform: `translate(-${borderSize}px,-${borderSize}px)`,
    }
    const buttonContainerStyle = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    }

    function selectNode(nextNode) {
      setPickedDOMNode({pickedDOMNode: nextNode})
    }

    function renderButton(icon, tooltip, onClick, style, hidden) {
      if (hidden) {
        return null
      }

      if (style.margin) {
        style = {
          ...style,
          position: 'absolute',
          margin: null,
          width: buttonSize,
          height: buttonSize,
          marginTop: style.margin[0],
          marginBottom: style.margin[0],
          marginLeft: style.margin[1],
          marginRight: style.margin[1],
        }
      }
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
          {top: `-${buttonSize}px`, left: 0, right: 0, margin: ['0', 'auto']},
          !node.parentElement
        )}
        {renderButton(
          'angle-right',
          'next sibling',
          () => selectNode(node.nextElementSibling),
          {right: `-${buttonSize}px`, top: 0, bottom: 0, margin: ['auto', '0']},
          !node.nextElementSibling
        )}
        {renderButton(
          'angle-down',
          'down one level',
          () => selectNode(node.firstElementChild),
          {bottom: `-${buttonSize}px`, left: 0, right: 0, margin: ['0', 'auto']},
          !node.firstElementChild
        )}
        {renderButton(
          'angle-left',
          'previous sibling',
          () => selectNode(node.previousElementSibling),
          {left: `-${buttonSize}px`, top: 0, bottom: 0, margin: ['auto', '0']},
          !node.previousElementSibling
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
          () => this.addNewTrack(node),
          {right: `-${buttonSize}px`, bottom: `-${buttonSize}px`}
        )}
      </div>
    </div>
  }
}
