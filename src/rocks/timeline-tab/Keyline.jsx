import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import customDrag from 'custom-drag'
import sortBy from 'lodash/collection/sortBy'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'react-animachine-enhancer'
import getPreviousSiblingOfKey from './getPreviousSiblingOfKey'
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
    const {model, timeline, actions, selectors} = props
    const keyHolderId = model.id
    const mouseTime = getMouseTime(props, monitor)
    const closestKey = selectors.getClosestKey({
      keyHolderId: model.id,
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
    const {model, actions} = props
    const keyHolderId = model.id
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

    const {model, timeline, actions, selectors, top, height} = props
    const keyHolderId = model.id
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
      start: PropTypes.number,
      pxpms: PropTypes.number,
      width: PropTypes.number,
    }),
    keys: PropTypes.arrayOf(PropTypes.shape({

    })),
    top: PropTypes.number,
    height: PropTypes.number,
    style: PropTypes.object,
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
    const {timeline, height, top, style, dragRef} = this.props

    return <canvas
      ref = {dragRef}
      width = {timeline.width}
      height = {height}
      style = {{position: 'absolute', top, ...style}}/>
  }

  postRender() {
    const {canvas, ctx} = this
    const {model, timeline} = this.props
    const {start} = timeline
    const colors = this.getColors()
    const end = start + getVisibleTime({timeline})
    const isGroup = model.type !== 'param'

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = colors.border
    ctx.moveTo(0, canvas.height - 0.5)
    ctx.lineTo(canvas.width, canvas.height - 0.5)
    ctx.stroke()

    const renderAllParam = model => {
      if (model.keys) {
        const sortedKeys = sortBy(model.keys, 'time')
        let firstKeyIdx = 0
        let lastKeyIdx = sortedKeys.length - 1

        //search the first and the last keys outside the rendered area
        sortedKeys.forEach((key, idx) => {
          if (
            key.time < -start &&
            key.time > sortedKeys[firstKeyIdx].time
          ) {
            firstKeyIdx = idx
          }
          else if (
            key.time > end &&
            key.time < sortedKeys[lastKeyIdx].time
          ) {
            lastKeyIdx = idx
          }
        })

        for (let i = firstKeyIdx; i <= lastKeyIdx; ++i) {
          const key = sortedKeys[i]
          this.drawKey(key, isGroup)

          if (i !== firstKeyIdx) {
            const startTime = sortedKeys[i-1].time
            this.drawEase(key, startTime)
          }
        }
      }

      if (model.params) {
        model.params.forEach(childParam => {
          renderAllParam(childParam)
        })
      }
    }

    renderAllParam(model)
  }

  drawKey(key, isGroup) {
    const {ctx} = this
    const {height, timeline} = this.props
    const colors = this.getColors()
    const keyPos = parseInt(convertTimeToPosition({
      timeline,
      time: key.time
    })) + 0.5
    const r = 2

    if (!isGroup) {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = key.selected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.moveTo(keyPos, 0)
      ctx.lineTo(keyPos, height)
      ctx.stroke()
      ctx.restore()
    }
    else {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = key.selected ? colors.selected : colors.normal
      ctx.fillStyle = key.selected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.arc(keyPos, height/2, r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
    //TODO
    // if (this.timeline.currTime === this.time) {
    //     ctx.save()
    //     ctx.beginPath()
    //     ctx.strokeStyle = colors.red
    //     ctx.lineWidth = 1
    //     ctx.arc(keyPos, height/2, 6, 0, 2 * Math.PI)
    //     ctx.stroke()
    //     ctx.restore()
    // }
  }

  drawEase(key, startTime) {
    const {ctx} = this
    const {height, timeline} = this.props
    const colors = this.getColors()
    const easer = createEaser(key.ease)
    const startPos = parseInt(convertTimeToPosition({timeline, time: startTime})) + 0.5
    const endPos = parseInt(convertTimeToPosition({timeline, time: key.time})) + 0.5
    const width = endPos - startPos

    if (width === 0) {
      return
    }

    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = colors.ease
    ctx.lineWidth = 1.2
    ctx.moveTo(startPos, height)

    for (let i = 0; i < width; ++i) {
      ctx.lineTo(startPos + i, height - height * easer.getRatio(i/width))
    }

    ctx.stroke()
    ctx.restore()
  }
}
