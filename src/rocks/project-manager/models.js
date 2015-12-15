import {observable} from 'mobservable'

function mapSources(sources, Class) {
  return sources.map(source => {
    const item = new Class()
    item.deserialiize(source)
    return item
  })
}

export class Ease {
  @observable id: string = ''
  @observable easeType: string = 'bezier'
  @observable pointAX: number = 0.3
  @observable pointAY: number = 0.3
  @observable pointBX: number = 0.7
  @observable pointBY: number = 0.7
  @observable roughEase: number = false
  @observable roughStrength: number = 1
  @observable roughPoints: number = 20
  @observable roughClamp: boolean = false
  @observable roughRandomise: boolean = true
  @observable roughTaper: string = 'none'

  deserialize(source) {
    this.id = source.id
    this.easeType = source.easeType
    this.pointAX = source.pointAX
    this.pointAY = source.pointAY
    this.pointBX = source.pointBX
    this.pointBY = source.pointBY
    this.roughEase = source.roughEase
    this.roughStrength = source.roughStrength
    this.roughPoints = source.roughPoints
    this.roughClamp = source.roughClamp
    this.roughRandomise = source.roughRandomise
    this.roughTaper = source.roughTaper
  }

  serialize() {
    return {
      id: this.id,
      easeType: this.easeType,
      pointAX: this.pointAX,
      pointAY: this.pointAY,
      pointBX: this.pointBX,
      pointBY: this.pointBY,
      roughEase: this.roughEase,
      roughStrength: this.roughStrength,
      roughPoints: this.roughPoints,
      roughClamp: this.roughClamp,
      roughRandomise: this.roughRandomise,
      roughTaper: this.roughTaper,
    }
  }
}

export class Key {
  @observable id: string = ''
  @observable time: int = 0
  @observable value: string = '0'
  @observable ease: Ease = null

  deserialize(source) {
    this.id = source.id
    this.time = source.time
    this.value = source.value
    this.ease = new Ease()
    this.ease.deserialize(source.ease)
    this.selected = source.selected
  }

  serialize() {
    return {
      id: this.id,
      time: this.time,
      value: this.value,
      else: this.ease && this.ease.serialize(),
    }
  }
}

export class Param {
  @observable id: string = ''
  @observable name: string = 'param'
  @observable keys: Array<Key> = []
  @observable openInTimeline: boolean = true

  deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.keys = mapSources(source.keys, Key)
    this.openInTimeline = source.openInTimeline
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      keys: this.keys.map(key => key.serialize()),
      openInTimeline: this.openInTimeline,
    }
  }
}

export class Selector {
  @observable id: string = ''
  @observable type: string = 'css'
  @observable value: string = ''

  deserialize(source) {
    this.id = source.id
    this.type = source.type
    this.value = source.value
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      value: this.value,
    }
  }
}

export class Track {
  @observable id: string = ''
  @observable name: string = 'param'
  @observable params: Array<Param> = []
  @observable selectors: Array<Selector> = []
  @observable openInTimeline: boolean = true

  deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.params = source.params
    this.selectors = mapSources(source.selectors, Selector)
    this.openInTimeline = source.openInTimeline
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      params: this.params.map(param => param.serialize()),
      selectors: this.selectors.map(sekector => sekector.serialize()),
      openInTimeline: this.openInTimeline,
    }
  }
}

function test (...args) {console.log('TESTED', ...args)}

export class Timeline {
  @observable id: string = ''
  @observable name: string = 'timeline'
  @observable isPlaying: boolean = false
  @observable isSeeking: boolean = false
  @observable currentTime: number = 0
  @observable length: number = 60000
  @observable pxpms: number = 1
  @observable width: number = 2000
  @observable start: number = 0
  @observable startMargin: number = 6
  @observable tracks: Array<Track> = []
  @observable selectedKeyHolderId: string = 'project'

  deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.isPlaying = source.isPlaying
    this.isSeeking = source.isSeeking
    this.currentTime = source.currentTime
    this.length = source.length
    this.pxpms = source.pxpms
    this.width = source.width
    this.start = source.start
    this.startMargin = source.startMargin
    this.tracks = mapSources(source.tracks, Track)
    this.selectedKeyHolderId = source.selectedKeyHolderId
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      isPlaying: this.isPlaying,
      isSeeking: this.isSeeking,
      currentTime: this.currentTime,
      length: this.length,
      pxpms: this.pxpms,
      width: this.width,
      start: this.start,
      startMargin: this.startMargin,
      tracks: this.tracks.map(timeline => timeline.serialize()),
      selectedKeyHolderId: this.selectedKeyHolderId,
    }
  }
}

export class Project {
  @observable id: string = ''
  @observable name: string = 'project'
  @observable timelines: Array<Timeline> = []
  @observable selectedTimelineId: string = 'project'

  deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.timelines = mapSources(ource.timelines, timelines)
    this.selectedTimelineId = source.selectedTimelineId
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      timelines: this.timelines.map(timeline => timeline.serialize()),
      selectedTimelineId: this.selectedTimelineId,
    }
  }
}
