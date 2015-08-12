import React from 'react'
import customDrag from 'custom-drag'
import sortBy from 'lodash/collection/sortBy'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'react-animachine-enhancer'
import getPreviousSiblingOfKey from './getPreviousSiblingOfKey'

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
  const {x} = monitor.getSourceClientOffset()
  const {model, timeline} = props
  return timeline.convertPositionToTime(x)
}

const dragOptions = {
  onDown(props, monitor) {
    const {model, timeline} = props
    const mouseTime = getMouseTime(props, monitor)
    const closestKey = model.findClosestKey(mouseTime)

    if (
      !closestKey ||
      (Math.abs(mouseTime - closestKey.time) * timeline.timescale) > 4
    ) {
      return false // prevent draggign
    }

    const {time} = closestKey
    const {shiftKey, ctrlKey} = monitor.getLastEvent()

    if (!shiftKey && !ctrlKey) {
      timeline.deselectAllKeys()
    }

    if (shiftKey || ctrlKey) {
      model.toggleKeysSelectionAtTime(time)
    }
    else {
      model.selectKeysAtTime(time)
    }

    monitor.setData({
      lastMouseTime: mouseTime
    })
  },

  onDrag(props, monitor) {
    const {model} = props
    const mouseTime = getMouseTime(props, monitor)
    const timeOffset = mouseTime - monitor.data.lastMouseTime

    model.forEachSelectedKey(key => key.time += timeOffset)

    monitor.setData({
      lastMouseTime: mouseTime
    })
  },

  onClick(props, monitor) {
    const {model, timeline, inlineEaseEditorStore, top, height} = props
    const mouseTime = getMouseTime(props, monitor)
    const nextKey = model.findNextKey(mouseTime)
    if (!nextKey) {
      return
    }
    const previousKey = model.findPreviousKey(mouseTime)
    timeline.deselectAllKeys()
    model.selectKeysAtTime(nextKey.time)
    const selectedKeys = model.collectSelectedKeys()
    inlineEaseEditorStore.set({
      top,
      height,
      startTime: previousKey ? previousKey.time : 0,
      endTime: nextKey.time,
      initialEase: nextKey.ease,
      controlledEases: selectedKeys.map(key => key.ease),
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

    const {model, timeline} = this.props
    model.on('change', () => this.forceUpdate)
    timeline.on('change', () => this.forceUpdate)
  }

  componentDidUpdate() {
    this.postRender()
  }

  // handleDoubleClick() {
  //   const {timeline, model, top} = this.props
  //   const nextKey = model.getNextKey(timeline.currentTime)
  //   if (!nextKey) {
  //     return
  //   }
  //   const previousKey = getPreviousSiblingOfKey(nextKey, timeline)
  //   const startTime = previousKey ? previousKey.time : 0
  //
  //   model.selectKeysAtTime(nextKey.time)
  //   const controlledEases = []
  //   model.forEachSelectedKey(key => controlledEases.push(key.ease))
  //   inlineEaseEditorStore.focus({
  //     top,
  //     startTime,
  //     endTime: nextKey.time,
  //     initialEase: nextKey.ease,
  //     controlledEases,
  //   })
  // }

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
    const {start, end} = timeline

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (model.modelType === 'Param' && model.getKeysLength() !== 0) {
      let visibleKeys = []

      model.forEachKey(key => {
        if (key.time >= start && key.time <= end) {
          visibleKeys.push(key)
        }
      })

      sortBy(visibleKeys, 'time').forEach((key, idx, arr) => {
        this.drawKey(key, model.isSelectedKey(key))

        const startTime = idx === 0 ? 0 : arr[idx - 1].time
        this.drawEase(key, startTime)
      })
    }
    else {

    }
  }

  drawKey(key, isSelected) {
    const {ctx} = this
    const {height, timeline} = this.props
    const keyPos = parseInt(timeline.convertTimeToPosition(key.time)) + 0.5
    const r = 2
    // if (line) {
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = isSelected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.moveTo(keyPos, 0)
      ctx.lineTo(keyPos, height)
      ctx.stroke()
      ctx.restore()
    // }

    // if (circle) {
      // ctx.save()
      // ctx.beginPath()
      // ctx.strokeStyle = isSelected ? colors.selected : colors.normal
      // ctx.fillStyle = isSelected ? colors.selected : colors.normal
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
    const startPos = parseInt(timeline.convertTimeToPosition(startTime)) + 0.5
    const endPos = parseInt(timeline.convertTimeToPosition(key.time)) + 0.5
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
