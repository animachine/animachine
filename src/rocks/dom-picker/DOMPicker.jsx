import React, {PropTypes} from 'react'
import {afflatus, createComputedValue} from 'afflatus'
import state from './state'
import {setPickedDOMNode} from './actions'
import {Button} from 'react-matterkit'

@afflatus
export default class DomPicker extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    getBounds: PropTypes.func,
    buttonSize: PropTypes.number,
    borderSize: PropTypes.number,
  }

  static defaultProps = {
    getBounds: () => ({
      x: 0,
      y: 0,
      w: window.innerWidth,
      h: window.innerHeight,
    }),
    buttonSize: 21,
    borderSize: 2,
  }

  constructor(props) {
    super(props)
    this.state = {hover: false}

    this.selector = createComputedValue(() => {
      const generateSelector = BETON.require('generate-selector')
      const node = state.pickedDOMNode
      const selector = node && generateSelector({node})
      console.log({selector})
      return selector
    })
  }

  handleMouseEnter = (e) => {
    this.setState({hover: true})
  }

  handleMouseLeave = (e) => {
    // this.setState({hover: false})
  }

  addNewTrack(node) {
    const {state} = BETON.require('project-manager')
    const qurey = this.selector()
    const track = state.currentTimeline.addTrack({
      name: query,
      selectors: [{type: 'css', query}],
    })
    state.currentTimeline.currentTrack = track
    setPickedDOMNode(null)
  }

  getRect() {
    const node = state.pickedDOMNode
    const {buttonSize, getBounds} = this.props
    let {top, left, width, height} = node.getBoundingClientRect()
    const [oTop, oLeft, oWidth, oHeight] = [top, left, width, height]
    const {x: wLeft, y: wTop, w: wWidth, h: wHeight} = getBounds()

    width = Math.max(buttonSize, oWidth)
    height = Math.max(buttonSize, oHeight)

    left += (oWidth - width) / 2
    top += (oHeight - height) / 2

    if (left < wLeft + buttonSize) {
        left = wLeft + buttonSize
        width = Math.max(buttonSize, oLeft + oWidth - left)
    }
    if (top < wTop + buttonSize) {
        top = wTop + buttonSize
        height = Math.max(buttonSize, oTop + oHeight - top)
    }
    if (left + width > wLeft + wWidth - buttonSize) {
      width = wLeft + wWidth - buttonSize - left
    }
    if (top + height > wTop + wHeight - buttonSize) {
      height = wTop + wHeight - buttonSize - top
    }

    return {left, top, width, height}
  }

  render() {
    const node = state.pickedDOMNode
    const {onChange, buttonSize, borderSize} = this.props

    if (!node) {
      return <div hidden/>
    }

    const {left, top, width, height} = this.getRect()
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
      setPickedDOMNode(nextNode)
    }

    function renderButton(icon, tooltip, onClick, originalStyle, hidden) {
      if (hidden) {
        return null
      }

      let style = {
        ...originalStyle,
        margin: null,
        width: buttonSize,
        height: buttonSize,
        textShadow: '0 0 2px #555, 0 0 2px #555'
      }

      if (originalStyle.margin) {
        style = {
          ...style,
          position: 'absolute',
          marginTop: originalStyle.margin[0],
          marginBottom: originalStyle.margin[0],
          marginLeft: originalStyle.margin[1],
          marginRight: originalStyle.margin[1],
        }
      }

      return <Button
        icon = {icon}
        mod = {{kind: 'stamp'}}
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
          'chevron-up',
          'up one level',
          () => selectNode(node.parentElement),
          {top: `-${buttonSize}px`, left: 0, right: 0, margin: ['0', 'auto']},
          !node.parentElement
        )}
        {renderButton(
          'chevron-right',
          'next sibling',
          () => selectNode(node.nextElementSibling),
          {right: `-${buttonSize}px`, top: 0, bottom: 0, margin: ['auto', '0']},
          !node.nextElementSibling
        )}
        {renderButton(
          'chevron-down',
          'down one level',
          () => selectNode(node.firstElementChild),
          {bottom: `-${buttonSize}px`, left: 0, right: 0, margin: ['0', 'auto']},
          !node.firstElementChild
        )}
        {renderButton(
          'chevron-left',
          'previous sibling',
          () => selectNode(node.previousElementSibling),
          {left: `-${buttonSize}px`, top: 0, bottom: 0, margin: ['auto', '0']},
          !node.previousElementSibling
        )}
        {renderButton(
          'times',
          'close',
          () => setPickedDOMNode(null),
          {right: `-${buttonSize}px`, top: `-${buttonSize}px`, margin: [0, 0]}
        )}
        {renderButton(
          'plus',
          'create a new track with this node',
          () => this.addNewTrack(node),
          {},
          !this.selector()
        )}
      </div>
    </div>
  }
}
