import events from 'events'

export default class Model extends events.EventEmitter {
  constructor(source) {
    super()
    this.setSource(source)
  }
}
