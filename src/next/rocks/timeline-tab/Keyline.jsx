import React from 'react'
import customDrag from 'custom-drag'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'react-animachine-enhancer'
import inlineEaseEditorStore from './inline-ease-editor/inlineEaseEditorStore'

const colors = (() => {
  const {selected, grey2: normal, red} = getTheme(this).getStyle('colors')

  return {
    selected,
    normal,
    red,
    ease: 'rgba(225,225,225,.23)'
  }
}())

const dragOptions = {
  onDown(props, monitor) {
    const {x} = monitor.getSourceClientOffset()
    const {model, timeline} = props
    const mouseTime = timeline.convertPositionToTime(x)
    const closestKey = model.findClosestKey(mouseTime)

    if (
      !closestKey ||
      (Math.abs(mouseTime - closestKey.time) * timeline.timescale) > 4
    ) {
      return false // prevent draggign
    }

    const {time} = closestKey
    const {shiftKey, ctrlKey} = monitor.getLastEvent()

    if (shiftKey && ctrlKey) {
      model.selectKeysAtTime(time)
    }
    else {
      timeline.deselectAllKeys()
      model.toggleKeysSelectionAtTime(time)
    }

    monitor.setData({
      lastTime: time
    })
  },
  onMove(props, monitor) {
    const {x} = monitor.getSourceClientOffset()
    const {model, timeline} = props
    const time = timeline.convertPositionToTime(x)
    const timeOffset = time - monitor.data.lastTime

    model.forEachSelectedKey(key => key.time += timeOffset)

    monitor.setData({
      lastTime: time
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

  handleDoubleClick() {
    const {timeline, model} = this.props
    const nextKey = model.getNextKey(timeline.currentTime)
    if (!nextKey) {
      return
    }

    model.selectKeysAtTime(nextKey.time)
    const controlledEases = []
    model.forEachSelectedKey(key => controlledEases.push(key.ease))
    inlineEaseEditorStore.focus({
      ///???
      controlledEases,
    })
  }

  render() {
    const {timeline, height, style, dragRef} = this.props

    return <canvas
      ref = {dragRef}
      width = {timeline.width}
      height = {height}
      style = {{position: 'absolute', ...style}}/>
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

      visibleKeys.forEach((key, idx) => {
        this.drawKey(key)

        const startTime = idx === 0 ? 0 : visibleKeys[idx - 1].time
        this.drawEase(key, startTime)
      })
    }
    else {

    }
  }

  timeToDrawPos(time) {
    const {start, timescale} = this.props.timeline
    return (time + start) * timescale
  }

  drawKey(key, isSelected) {
    const {ctx} = this
    const {height} = this.props
    const keyPos = parseInt(this.timeToDrawPos(key.time)) + 0.5
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
    const {height} = this.props
    const easer = createEaser(key.ease)
    const startPos = parseInt(this.timeToDrawPos(startTime)) + 0.5
    const endPos = parseInt(this.timeToDrawPos(key.time)) + 0.5
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
