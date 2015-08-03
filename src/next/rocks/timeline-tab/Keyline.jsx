import React from 'react'
import customDrag from 'custom-drag'

const colors = {
  selected: '#01FF70',
  normal: '#eee'
}


const dragOptions = {
  onDown(props, monitor) {
    const {x: clientX} = monitor.getClientOffset()
    const {model, timeline} = props
    const time = timeline.clientXToTime(clientX)
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
    const {x: clientX} = monitor.getClientOffset()
    const {model, timeline} = props
    const time = timeline.clientXToTime(clientX)
    const timeOffset = time - monitor.data.lastTime

    model.translateSelectedKeys(timeOffset)

    monitor.setData({
      lastTime: time
    })
  }
}

@customDrag(dragOptions)
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

      visibleKeys.forEach(key => this.drawKey(key))
    }
    else {
      //
    }
  }

  timeToDrawPos(time) {
    const {start, width, timescale} = this.props.timeline
    return (time + start) * timescale
  }

  drawKey(key, isSelected) {
    const {ctx} = this

    var {height} = this.props
    var keyPos = parseInt(this.timeToDrawPos(key.time)) + 0.5
    var r = 2
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
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = isSelected ? colors.selected : colors.normal
      ctx.fillStyle = isSelected ? colors.selected : colors.normal
      ctx.lineWidth = 1
      ctx.arc(keyPos, height/2, r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    // }
    //TODO
    // if (this.timeline.currTime === this.time) {
    //     ctx.save()
    //     ctx.beginPath()
    //     ctx.strokeStyle = amgui.color.red
    //     ctx.lineWidth = 1
    //     ctx.arc(keyPos, height/2, 6, 0, 2 * Math.PI)
    //     ctx.stroke()
    //     ctx.restore()
    // }
  }

  drawEase() {

    if (!this.ease) return

    var looks = this.looks || this.parentKeyLine.keyLooks

    var ease = this.ease,
        color = (looks.ease && looks.ease.color) || 'rgba(225,225,225,.23)',
        height = this._height,
        keyPos = this.timeline.timeToRenderPos(this.time),
        prevKey = this.getPrevKey(),
        prevKeyPos = this.timeline.timeToRenderPos(prevKey ? prevKey.time : 0),
        width = keyPos - prevKeyPos

    if (width === 0) return

    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.2
    ctx.moveTo(prevKeyPos, height)

    for (var i = 0; i < width; ++i) {

        ctx.lineTo(prevKeyPos + i, height - height * ease.getRatio(i/width))
    }

    ctx.stroke()
    ctx.restore()
  }
}
