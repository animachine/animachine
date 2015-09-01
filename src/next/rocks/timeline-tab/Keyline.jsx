import React from 'react'
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

const colors = (() => {
  const {selected, grey2: normal, red} = getTheme().getStyle('colors')

  return {
    selected,
    normal,
    red,
    ease: 'rgba(225,225,225,.23)'
  }
}())

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
      (Math.abs(mouseTime - closestKey.time) * timeline.timescale) > 4
    ) {
      return false // prevent draggign
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
    const previousKey = selectors.getPreviousKey({keyHolderId, time: mouseTime})
    actions.deselectAllKeys({keyHolderId: timeline.id})
    actions.selectKeysAtTime({keyHolderId, time: nextKey.time})
    const selectedKeys = selectors.collectSelectedKeys({keyHolderId})

    actions.setInlineEaseEditorOfTimeline({
      timelineId: timeline.id,
      inlineEaseEditor: {
        top,
        height,
        startTime: previousKey ? previousKey.time : 0,
        endTime: nextKey.time,
        controlEaseId: nextKey.ease,
        controlledEaseIds: selectedKeys.map(key => key.ease),
      }
    })
  }
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Keyline extends React.Component {
  componentDidMount() {
    this.canvas = React.findDOMNode(this)
    this.ctx = this.canvas.getContext('2d')

    this.postRender()
  }

  componentDidUpdate() {
    this.postRender()
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
    const end = start + getVisibleTime({timeline})

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (model.type === 'param' && model.keys.length !== 0) {
      let visibleKeys = []

      model.keys.forEach(key => {
        if (key.time >= start && key.time <= end) {
          visibleKeys.push(key)
        }
      })

      sortBy(visibleKeys, 'time').forEach((key, idx, arr) => {
        this.drawKey(key)

        const startTime = idx === 0 ? 0 : arr[idx - 1].time
        this.drawEase(key, startTime)
      })
    }
    else {
      
    }
  }

  drawKey(key) {
    const {ctx} = this
    const {height, timeline} = this.props
    const keyPos = parseInt(convertTimeToPosition({
      timeline,
      time: key.time
    })) + 0.5
    const r = 2
    // if (line) {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = key.selected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.moveTo(keyPos, 0)
      ctx.lineTo(keyPos, height)
      ctx.stroke()
      ctx.restore()
    // }

    // if (circle) {
      // ctx.save()
      // ctx.beginPath()
      // ctx.strokeStyle = key.selected ? colors.selected : colors.normal
      // ctx.fillStyle = key.selected ? colors.selected : colors.normal
      // ctx.lineWidth = 1
      // ctx.arc(keyPos, height/2, r, 0, 2 * Math.PI)
      // ctx.fill()
      // ctx.stroke()
      // ctx.restore()
    // }
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
