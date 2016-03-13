import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {afflatus} from 'afflatus'
import steps from './steps'
import customDrag from 'custom-drag'
import {convertPositionToTime, getVisibleTime} from '../utils'

const color = {
  bg3: 'white'
}

function handleMouse(props, monitor) {
  const {dragMode} = monitor.data
  const {timeline, actions} = props
  const {currentTime, pxpms} = timeline
  const {initStart, initPxpms} = monitor.data
  const offset = monitor.getDifferenceFromInitialOffset().x

  if (dragMode === 'seek') {
    let {x: position} = monitor.getSourceClientOffset()
    let currentTime = convertPositionToTime(timeline, position)
    actions.set(timeline, 'isPlaying', false)
    actions.set(timeline, 'currentTime', currentTime)
  }
  else if (dragMode === 'translate') {
    let start = initStart + (offset / pxpms)
    actions.set(timeline, 'start', start)
  }
  else if (dragMode === 'scale') {
    let pxpms = initPxpms + (offset / 100)
    actions.set(timeline, 'pxpms', pxpms)
    //keep pointer in the same position
    let mdPos = (initStart + currentTime) * initPxpms
    let start = -((currentTime * pxpms) - mdPos) / pxpms
    actions.set(timeline, 'start', start)
  }
}

const dragOptions = {
  onDown(props, monitor) {
    const {shiftKey, ctrlKey} = monitor.getLastEvent().nativeEvent
    const {timeline, actions} = props
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
      initPxpms: timeline.pxpms,
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
@afflatus
export default class Timetape extends React.Component {
  // static propTypes = {
  //   timeline: PropTypes.shape({
  //     start: PropTypes.number,
  //     pxpms: PropTypes.number,
  //     width: PropTypes.number,
  //   }),
  //   height: PropTypes.number,
  // }

  // shouldComponentUpdate(next) {
  //   const {props} = this
  //   return (
  //     props.timeline.start !== next.timeline.start ||
  //     props.timeline.pxpms !== next.timeline.pxpms ||
  //     props.timeline.width !== next.timeline.width ||
  //     props.height !== next.height
  //   )
  // }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this)
    this.ctx = this.canvas.getContext('2d')
    this.postRender()
  }

  componentDidUpdate() {
    //HACK i dont know why but it triggers Timeline update without the timeout
    setTimeout(() => this.postRender())
  }

  render() {
    const {width, height, style, dragRef, timeline} = this.props
    //HACK to make it update
    //TODO fix it!
    const {start, pxpms, width: _} = timeline
    return <canvas ref={dragRef}  width={width} height={height} style={style}/>
  }

  postRender() {
    const {canvas, ctx} = this
    const {timeline, height} = this.props
    const {start, pxpms, width} = timeline
    const visibleTime = getVisibleTime(timeline)
    const maxMarkers = width / 4
    let step

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
        ctx.moveTo(~~(i * pxpms) + 0.5, height)
        ctx.lineTo(~~(i * pxpms) + 0.5, height * 0.75)
      }
      ctx.stroke()

      for (let i = start % step.big; i < visibleTime; i += step.big) {
        ctx.moveTo(~~(i * pxpms) + 0.5, height)
        ctx.lineTo(~~(i * pxpms) + 0.5, height * 0.62)
      }
      ctx.stroke()

      for (let i = start % step.time; i < visibleTime; i += step.time) {
        const time = Math.floor((i - start) / step.time) * step.time//HACK
        const text = step.format(time)
        const textW = ctx.measureText(text).width
        const textLeft = i * pxpms - (time === 0 ? 0 : (textW / 2))

        ctx.fillText(text, textLeft, 12)
      }
      ctx.stroke()
    }
  }
}
