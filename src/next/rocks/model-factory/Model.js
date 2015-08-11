import EventEmitter from 'eventman'
var modelId = 0

export default class Model extends EventEmitter {
  constructor(source) {
    super()

    this.setMaxListeners(2001)

    this.modelId = modelId++

    this.setSource(source)
  }
}
