import React from 'react'
import steps from './steps'
import customDrag from 'custom-drag'

const color = {
  bg3: 'white'
}

const dragOptions = {
  onDown(props, monitor) {
    const {shiftKey, ctrlKey} = monitor.getLastEvent()
    const {timeline} = props
    var dragMode

    if (shiftKey) {
      dragMode = 'translate'
    }
    else if (ctrlKey) {
      dragMode = 'scale'
    }
    else {
      dragMode = 'seek'
    }

    monitor.setData({
      dragMode,
      initStart: timeline.start,
      initTimescale: timeline.timescale,
    })
  },
  onDrag(props, monitor) {
    const {dragMode} = monitor.data
    const {timeline} = props
    const {currentTime, timescale} = timeline
    const {initStart, initTimescale} = monitor.data
    const offset = monitor.getDifferenceFromInitialOffset().x

    if (dragMode === 'seek') {
      let {x} = monitor.getSourceClientOffset()
      let time = timeline.convertPositionToTime(x)

      timeline.currentTime = time
    }
    else if (dragMode === 'translate') {
      timeline.start = initStart + (offset / timescale)
    }
    else if (dragMode === 'scale') {
      timeline.timescale = initTimescale + (offset / 1000)
      //keep pointer in the same position
      var mdPos = (initStart + currentTime) * initTimescale
      timeline.start = -((currentTime * timescale) - mdPos) / timescale
    }
  }
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Timetape extends React.Component {
  componentDidMount() {
    this.canvas = React.findDOMNode(this)
    this.ctx = this.canvas.getContext('2d')
    this.postRender()
  }

  componentDidUpdate() {
    this.postRender()
  }

  render() {
    const {width, height, style} = this.props
    return <canvas width={width} height={height} style={style}/>
  }

  postRender() {
    const {canvas, ctx} = this
    const {timeline, height} = this.props
    const {start, visibleTime, timescale, width} = timeline
    const maxMarkers = width / 4
    var step, text, textW

    canvas.width = width
    canvas.height = height

    steps.forEach(s => {
      if ((visibleTime / s.small) < maxMarkers && (!step || step.small > s.small)) {
        step = s
      }
    })

    if (step) {
      ctx.linweidth = 0.5
      ctx.strokeStyle = color.bg3
      ctx.fillStyle = color.bg3
      ctx.font = ~~(height * 0.5) + 'px "Open Sans"'

      for (let i = start % step.small; i < visibleTime; i += step.small) {
        ctx.moveTo(~~(i * timescale) + 0.5, height)
        ctx.lineTo(~~(i * timescale) + 0.5, height * 0.75)
      }
      ctx.stroke()

      for (let i = start % step.big; i < visibleTime; i += step.big) {
        ctx.moveTo(~~(i * timescale) + 0.5, height)
        ctx.lineTo(~~(i * timescale) + 0.5, height * 0.62)
      }
      ctx.stroke()

      for (let i = start % step.time; i < visibleTime; i += step.time) {
        text = step.format(i - start)
        textW = ctx.measureText(text).width / 2
        ctx.fillText(text, i * timescale - textW, 12)
      }
      ctx.stroke()
    }
  }
}
