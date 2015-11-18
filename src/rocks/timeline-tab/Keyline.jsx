import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import customDrag from 'custom-drag'
import sortBy from 'lodash/collection/sortBy'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'react-animachine-enhancer'
import getPreviousSiblingOfKey from './getPreviousSiblingOfKey'
import shallowEqual from 'react-pure-render/shallowEqual'
import {
  convertPositionToTime,
  convertTimeToPosition,
  getVisibleTime,
} from './utils'

function getMouseTime(props, monitor) {
  const {x: position} = monitor.getSourceClientOffset()
  const {timeline} = props
  return convertPositionToTime({timeline, position})
}

const dragOptions = {
  onDown(props, monitor) {
    const {keyHolderId, timeline, actions, selectors} = props
    const mouseTime = getMouseTime(props, monitor)
    const closestKey = selectors.getClosestKey({
      keyHolderId,
      time: mouseTime
    })

    if (
      !closestKey ||
      (Math.abs(mouseTime - closestKey.time) * timeline.pxpms) > 4
    ) {
      return false // prevent dragging
    }

    monitor.setData({hitKeys: true})

    const {time} = closestKey
    const {shiftKey, ctrlKey} = monitor.getLastEvent().nativeEvent

    if (!shiftKey && !ctrlKey) {
      actions.deselectAllKeys({keyHolderId: timeline.id})
    }

    if (shiftKey || ctrlKey) {
      actions.toggleKeysSelectionAtTime({time, keyHolderId})
    }
    else {
      actions.selectKeysAtTime({time, keyHolderId})
    }

    monitor.setData({
      lastMouseTime: mouseTime
    })
  },

  onDrag(props, monitor) {
    const {keyHolderId, actions} = props
    const mouseTime = getMouseTime(props, monitor)
    const offset = mouseTime - monitor.data.lastMouseTime

    monitor.setData({
      lastMouseTime: mouseTime
    })

    actions.translateSelectedKeys({keyHolderId, offset})
  },

  onClick(props, monitor) {
    if (monitor.data.hitKeys) {
      return
    }

    const {keyHolderId, timeline, actions, selectors, top, height} = props
    const mouseTime = getMouseTime(props, monitor)
    const nextKey = selectors.getNextKey({keyHolderId, time: mouseTime})
    if (!nextKey) {
      return
    }
    actions.deselectAllKeys({keyHolderId: timeline.id})
    actions.selectKeysAtTime({keyHolderId, time: nextKey.time})
    const selectedKeys = selectors.collectSelectedKeys({keyHolderId})

    actions.setInlineEaseEditorOfTimeline({
      timelineId: timeline.id,
      inlineEaseEditor: {
        top,
        height,
        targetKeyId: nextKey.id,
        controlledEaseIds: selectedKeys.map(key => key.ease),
      }
    })
  }
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Keyline extends React.Component {
  static propTypes = {
    timeline: PropTypes.shape({
      start: PropTypes.number.isRequired,
      pxpms: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
    }).isRequired,
    keyHolderId: PropTypes.string.isRequired,
    positionSequence: PropTypes.arrayOf(PropTypes.number).isRequired,
    easeSequences: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.object,
          PropTypes.number
        ])
      )
    ).isRequired,
    selectedSequence: PropTypes.arrayOf(PropTypes.boolean).isRequired,
    top: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    const {props} = this

    return props.keyHolderId !== nextProps.keyHolderId
      || props.timeline.start !== nextProps.timeline.start
      || props.timeline.pxpms !== nextProps.timeline.pxpms
      || props.timeline.width !== nextProps.timeline.width
      || props.top !== nextProps.top
      || props.height !== nextProps.height
      || !shallowEqual(props.positionSequence, nextProps.positionSequence)
      || !shallowEqual(props.selectedSequence, nextProps.selectedSequence)
      || props.easeSequences.length !== nextProps.easeSequences.length
      || !props.easeSequences.every((easeSequence, idx) => {
        return shallowEqual(easeSequence, nextProps.easeSequences[idx])
      })
  }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this)
    this.ctx = this.canvas.getContext('2d')

    this.postRender()
  }

  componentDidUpdate() {
    this.postRender()
  }

  getColors() {
    const {
      selected,
      grey2: normal,
      bg: border,
      red
    } = getTheme(this).getStyle('colors')

    return {
      selected,
      normal,
      border,
      red,
      ease: 'rgba(225,225,225,.23)'
    }
  }

  render() {
    const {timeline, height, top, dragRef} = this.props

    return <canvas
      ref = {dragRef}
      width = {timeline.width}
      height = {height}
      style = {{position: 'absolute', left: 0, top}}/>
  }

  postRender() {
    var end = PPP.start('keyline postrender')
    const {canvas, ctx} = this
    const colors = this.getColors()
    const {
      easeSequences,
      positionSequence,
      selectedSequence,
      isGroup,
    } = this.props

    //clear and render border line
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = colors.border
    ctx.beginPath()
    ctx.moveTo(0, canvas.height - 0.5)
    ctx.lineTo(canvas.width, canvas.height - 0.5)
    ctx.stroke()

    easeSequences.forEach((easeSequence) => {
      for (let i = 0; i < easeSequence.length - 2; i += 2) {
        const startPosition = easeSequence[i]
        const ease = easeSequence[i + 1]
        const endPosition = easeSequence[i + 2]
        this.drawEase(ease, startPosition, endPosition)
      }
    })

    for (let i = 0; i < positionSequence.length; ++i) {
      const position = positionSequence[i]
      const selected = selectedSequence[i]
      this.drawKey(position, selected, isGroup)
    }
    end()
  }

  drawKey(position, selected, isGroup) {
    const {ctx} = this
    const {height} = this.props
    const colors = this.getColors()
    const r = 2

    if (isGroup) {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = selected ? colors.selected : colors.normal
      ctx.fillStyle = selected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.arc(position, height/2, r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
    else {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = selected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.moveTo(position, 0)
      ctx.lineTo(position, height)
      ctx.stroke()
      ctx.restore()
    }
    //TODO
    // if (this.timeline.currTime === this.time) {
    //     ctx.save()
    //     ctx.beginPath()
    //     ctx.strokeStyle = colors.red
    //     ctx.lineWidth = 1
    //     ctx.arc(position, height/2, 6, 0, 2 * Math.PI)
    //     ctx.stroke()
    //     ctx.restore()
    // }
  }

  drawEase(ease, startPosition, endPosition) {
    const {ctx} = this
    const {height} = this.props
    const colors = this.getColors()
    const easer = createEaser(ease)
    const width = endPosition - startPosition

    if (width === 0) {
      return
    }

    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = colors.ease
    ctx.lineWidth = 1.2
    ctx.moveTo(startPosition, height)

    for (let i = 0; i < width; ++i) {
      ctx.lineTo(startPosition + i, height - height * easer.getRatio(i/width))
    }

    ctx.stroke()
    ctx.restore()
  }
}
