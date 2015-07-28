import React from 'react'

export default Keyline extends React.Component {

  componentDidMount() {
    this.canvas = React.findDOMNode(this)
    this.ctx = canvas.getContext('2d')

    BETON.getRock('config', config => {
      this.config = config
      this.postRender()
    })
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

    ctx.clearRect(canvas.width, canvas.height)

    if (model.type === 'Param' && model.getKeysLength() !== 0) {
      let visibleKey = []

      param.forEachKeys(key => {
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
    const {start, width, visibleTime} = this.timeline
    return (visibleTime / (time - start)) * width
  }

  drawKey(key, selected) {
    const {canvas, ctx, timeline} = this

    var looks = this.looks || this.parentKeyLine.keyLooks,
        height = this.config.size,
        keyPos = parseInt(this.timeToDrawPos(this.time)) + 0.5,
        line = looks.line,
        circle = looks.circle,
        r = 2,
        isSelected = this._isSelected;

    if (line) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? amgui.color.selected : (line.color || '#eee');
      ctx.lineWidth = line.width || 1;
      ctx.moveTo(keyPos, 0);
      ctx.lineTo(keyPos, height);
      ctx.stroke();
      ctx.restore();
    }

    if (circle) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? amgui.color.selected : (circle.color || '#eee');
      ctx.fillStyle = isSelected ? amgui.color.selected : (circle.fillColor || '#eee');
      ctx.lineWidth = circle.width || 1;
      ctx.arc(keyPos, height/2,
          'r' in circle ? circle.r : r,
          'arcStart' in circle ? circle.arcStart : 0,
          'arcEnd' in circle ? circle.arcEnd : 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    //TODO
    // if (this.timeline.currTime === this.time) {
    //     ctx.save();
    //     ctx.beginPath();
    //     ctx.strokeStyle = amgui.color.red;
    //     ctx.lineWidth = 1;
    //     ctx.arc(keyPos, height/2, 6, 0, 2 * Math.PI);
    //     ctx.stroke();
    //     ctx.restore();
    // }
  }

  drawEase() {

    if (!this.ease) return;

    var looks = this.looks || this.parentKeyLine.keyLooks;

    var ease = this.ease,
        color = (looks.ease && looks.ease.color) || 'rgba(225,225,225,.23)',
        height = this._height,
        keyPos = this.timeline.timeToRenderPos(this.time),
        prevKey = this.getPrevKey(),
        prevKeyPos = this.timeline.timeToRenderPos(prevKey ? prevKey.time : 0),
        width = keyPos - prevKeyPos;

    if (width === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.moveTo(prevKeyPos, height);

    for (var i = 0; i < width; ++i) {

        ctx.lineTo(prevKeyPos + i, height - height * ease.getRatio(i/width));
    }

    ctx.stroke();
    ctx.restore();
  }
}
