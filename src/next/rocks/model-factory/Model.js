import EventEmitter from 'eventman'
var modelId = 0

export default class Model extends EventEmitter {
  constructor(source) {
    super()

    this.modelId = modelId++

    this.setSource(source)
  }
}
