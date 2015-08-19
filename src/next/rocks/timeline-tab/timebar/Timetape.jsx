import React from 'react'
import steps from './steps'
import customDrag from 'custom-drag'

const color = {
  bg3: 'white'
}

function handleMouse(props, monitor) {
  const {dragMode} = monitor.data
  const {timeline, actions} = props
  const timelineId = timeline.id
  const {currentTime, timescale} = timeline
  const {initStart, initTimescale} = monitor.data
  const offset = monitor.getDifferenceFromInitialOffset().x

  if (dragMode === 'seek') {
    let {x} = monitor.getSourceClientOffset()
    let currentTime = timeline.convertPositionToTime(x)
    actions.setCurrentTimeOfTimeline({timelineId, currentTime})
  }
  else if (dragMode === 'translate') {
    let start = initStart + (offset / timescale)
    actions.setStartOfTimeline({timelineId, start})
  }
  else if (dragMode === 'scale') {
    let timescale = initTimescale + (offset / 1000)
    actions.setTimescaleOfTimeline({timelineId, timescale})
    //keep pointer in the same position
    let mdPos = (initStart + currentTime) * initTimescale
    let start = -((currentTime * timescale) - mdPos) / timescale
    actions.setStartOfTimeline({timelineId, start})
  }
}

const dragOptions = {
  onDown(props, monitor) {

    const {shiftKey, ctrlKey} = monitor.getLastEvent().nativeEvent
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

    handleMouse(props, monitor)
  },
  onDrag(props, monitor) {
    handleMouse(props, monitor)
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
    const {width, height, style, dragRef} = this.props
    return <canvas ref={dragRef}  width={width} height={height} style={style}/>
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
