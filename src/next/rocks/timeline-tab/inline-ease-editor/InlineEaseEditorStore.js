import EventEmitter from 'eventman'

export default class InlineEaseEditorStore extends EventEmitter {
  get isFocused() {
    return !!this.initialEase
  }

  set(options) {
    this.top = options.top
    this.startTime = options.startTime
    this.endTime = options.endTime
    this.initialEase = options.initialEase
    this.controlledEases = options.controlledEases
    
    this.emit('change')
  }
}
