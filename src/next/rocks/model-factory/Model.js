import EventEmitter from 'eventman'

export default class Model extends EventEmitter {
  constructor(source) {
    super()
    this.setSource(source)
  }
}
