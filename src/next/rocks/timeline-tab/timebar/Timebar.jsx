import React from 'react'
import steps from './steps'

export default class Timebar extends React.Component {
  componentDidMount() {
    this.canvas = React.findDOMNode(this)
    this.ctx = canvas.getContext('2d')
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
    const {canvas, ctx, timeline} = this
    const {start, end} = timeline
    const {model} = this.props

    var start = this._start,
        length = this._length,
        visibleTime = this.visibleTime,
        height = this._height,
        scale = this.timescale,
        width = this._width,
        maxMarkers = width / 4,
        step, text, textW,
        ctx = this._ctxTape

    this._canvasTape.width = width
    this._canvasTape.height = height

    steps.forEach(s => {
      if ((this.visibleTime / s.small) < maxMarkers && (!step || step.small > s.small)) {
        step = s
      }
    })

    if (step) {
      ctx.linweidth = 0.5
      ctx.strokeStyle = amgui.color.bg3
      ctx.fillStyle = amgui.color.bg3
      ctx.font = ~~(this._height * 0.5) + 'px "Open Sans"'

      for (let i = start % step.small; i < visibleTime; i += step.small) {
        ctx.moveTo(~~(i * scale) + 0.5, height)
        ctx.lineTo(~~(i * scale) + 0.5, height * 0.75)
      }
      ctx.stroke()

      for (let i = start % step.big; i < visibleTime; i += step.big) {
        ctx.moveTo(~~(i * scale) + 0.5, height)
        ctx.lineTo(~~(i * scale) + 0.5, height * 0.62)
      }
      ctx.stroke()

      for (let i = start % step.time; i < visibleTime; i += step.time) {
        text = step.format(i - start)
        textW = ctx.measureText(text).width / 2
        ctx.fillText(text, i * scale - textW, 12)
      }
      ctx.stroke()
    }

    this._refreshPointer()

    var endWidth = ((visibleTime - (start + length)) * scale)
    this._deEndShadow.style.width = Math.max(0, Math.min(width, endWidth)) + 'px'
  }
}
