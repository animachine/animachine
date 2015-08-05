import EventEmitter from 'eventman'

export default class State extends EventEmitter {
  focusKey(key) {
    this._focusedKey = key
    this.emit('change')
  },
  blurKey() {
    this._focusedKey = null
    this.emit('change')
  }
}
