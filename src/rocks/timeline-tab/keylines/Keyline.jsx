import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import customDrag from 'custom-drag'
import sortBy from 'lodash/collection/sortBy'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'animachine-connect'
import getPreviousSiblingOfKey from './getPreviousSiblingOfKey'
import shallowEqual from 'react-pure-render/shallowEqual'
import {
  convertPositionToTime,
  convertTimeToPosition,
  getVisibleTime,
  closestNumber
} from './utils'

function getMouseTime(props, monitor) {
  const {x: position} = monitor.getSourceClientOffset()
  const timeline = props.keyHolder.parentTimeline
  return convertPositionToTime(timeline, position)
}

const dragOptions = {
  onDown(props, monitor) {
    const {keyHolder, actions} = props
    const {pxpms} = keyHolder.parentTimeline
    const mouseTime = getMouseTime(props, monitor)
    const time = closestNumber(keyHolder.ketTimes, mouseTime)

    if ((Math.abs(mouseTime - time) * pxpms) > 4) {
      return false // prevent dragging
    }

    monitor.setData({hitKeys: true})

    const {shiftKey, ctrlKey} = monitor.getLastEvent().nativeEvent

    if (!shiftKey && !ctrlKey) {
      actions.deselectAllKeys(keyHolder)
    }

    if (shiftKey || ctrlKey) {
      actions.toggleKeysSelectionAtTime(keyHolder, time)
    }
    else {
      actions.selectKeysAtTime(keyHolder, time)
    }

    monitor.setData({
      lastMouseTime: mouseTime
    })
  },

  onDrag(props, monitor) {
    const {keyHolder, actions} = props
    const mouseTime = getMouseTime(props, monitor)
    const offset = mouseTime - monitor.data.lastMouseTime

    monitor.setData({
      lastMouseTime: mouseTime
    })

    actions.translateSelectedKeys({keyHolder, offset})
  },

  onClick(props, monitor) {
    if (monitor.data.hitKeys) {
      return
    }

    const {keyHolder, timeline, actions, selectors, top, height} = props
    const mouseTime = getMouseTime(props, monitor)
    const nextKey = selectors.getNextKey({keyHolder, time: mouseTime})
    if (!nextKey) {
      return
    }
    actions.deselectAllKeys({keyHolder: timeline.id})
    actions.selectKeysAtTime({keyHolder, time: nextKey.time})
    const selectedKeys = selectors.collectSelectedKeys({keyHolder})

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
    keyHolder: PropTypes.string.isRequired,
    positionSequence: PropTypes.arrayOf(PropTypes.number).isRequired,
    easeSequences: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.object,
          PropTypes.number
        ])
      )
    ).isRequired,
    selectedSequence: PropTypes.arrayOf(PropTypes.bool).isRequired,
    top: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    const {props} = this

    return props.keyHolder !== nextProps.keyHolder
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
    const {timeline, height, top, dragRef, keyHolder} = this.props
    const colors = this.getColors()

    function renderParam(param) {
      const {height} = this.props
      const result = param.keys.map(key => (
        <Key
          key = {key}
          colors = {colors}
          height = {height}/>
      ))
      for (let i = 1; i < param.keys.length; ++i) {
        result.push(
          <Ease
            height = {height}
            colors = {colors}
            beforeKey = {param.keys[i-1]}
            afterKey = {param.keys[i]}/>
        )
      }
      return result
    }

    return <svg
      ref = {dragRef}
      style = {{
        position: 'absolute',
        left: 0,
        top,
        width: timeline.width,
        height
      }}>
        {keyHolder.params
          ? keyHolder.param.map(param => renderParam(param))
          : renderParam(keyHolder)
        }
      </svg>
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
