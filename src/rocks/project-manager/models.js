import {observable} from 'mobservable'
import {registerId, createId} from './id-store'
import {createEaser} from 'animachine-connect'

import uniq from 'lodash/array/uniq'
import flatten from 'lodash/array/flatten'
import {getValueOfParamAtTime} from './getters'

function mapSources(sources = [], ItemClass, parent) {
  return sources.map(source => {
    const item = new ItemClass(source)
    item.parent = parent
    return item
  })
}

function sortNum(a, b) {
  return a - b
}

function constructor(source = {}) {
  this.id = source.id ? registerId(source.id) : createId()
  this._deserialize(source)
}

function findParent(item, ParentClass) {
  let parent = item.parent
  while (parent) {
    if (parent instanceof ParentClass) {
      return parent
    }
    parent = parent.parent
  }
}

export class Ease {
  constructor() {constructor.apply(this, arguments)}

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

  @observable parent: Key = null
  @observable get parentKey() {return findParent(this, Key)}
  @observable get parentParam() {return findParent(this, Param)}
  @observable get parentTrack() {return findParent(this, Track)}
  @observable get parentTimeline() {return findParent(this, Timeline)}
  @observable get parentProject() {return findParent(this, Project)}

  @observable get easer() {return createEaser(this)}

  _deserialize(source) {
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
  constructor() {constructor.apply(this, arguments)}

  @observable id: string = ''
  @observable time: int = 0
  @observable value: string = '0'
  @observable ease: Ease = null
  @observable selected: boolean = false

  @observable parent: Param = null
  @observable get parentParam() {return findParent(this, Param)}
  @observable get parentTrack() {return findParent(this, Track)}
  @observable get parentTimeline() {return findParent(this, Timeline)}
  @observable get parentProject() {return findParent(this, Project)}

  _deserialize(source) {
    this.id = source.id
    this.time = source.time
    this.value = source.value
    this.ease = new Ease(source.ease)
    this.ease.parent = this
    this.selected = source.selected
  }

  serialize() {
    return {
      id: this.id,
      time: this.time,
      value: this.value,
      else: this.ease && this.ease.serialize(),
      selected: this.selected,
    }
  }
}

export class Param {
  constructor() {constructor.apply(this, arguments)}

  @observable id: string = ''
  @observable name: string = 'param'
  @observable keys: Array<Key> = []
  @observable openInTimeline: boolean = true

  _deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.keys = mapSources(source.keys, Key, this)
    this.openInTimeline = source.openInTimeline
  }

  @observable parent: Track = null
  @observable get parentTrack() {return findParent(this, Track)}
  @observable get parentTimeline() {return findParent(this, Timeline)}
  @observable get parentProject() {return findParent(this, Project)}

  @observable get keyTimes() {
    return this.keys.map(key => key.time).sort(sortNum)
  }

  @observable get currentValue() {
    return getValueOfParamAtTime(this, this.parentTimeline.currentTime)
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
  constructor() {constructor.apply(this, arguments)}

  @observable id: string = ''
  @observable type: string = 'css'
  @observable query: any = null

  @observable parent: Track = null
  @observable get parentTrack() {return findParent(this, Track)}
  @observable get parentTimeline() {return findParent(this, Timeline)}
  @observable get parentProject() {return findParent(this, Project)}

  _deserialize(source) {
    this.id = source.id
    this.type = source.type
    this.query = source.query
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      query: this.query,
    }
  }
}

export class Track {
  constructor() {constructor.apply(this, arguments)}

  @observable id: string = ''
  @observable name: string = 'param'
  @observable params: Array<Param> = []
  @observable selectors: Array<Selector> = []
  @observable openInTimeline: boolean = true

  @observable parent: Timeline = null
  @observable get parentTimeline() {return findParent(this, Timeline)}
  @observable get parentProject() {return findParent(this, Project)}

  @observable get keyTimes() {
    return uniq(flatten(this.params.map(param => param.keyTimes))).sort(sortNum)
  }

  _deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.params = mapSources(source.params, Param, this)
    this.selectors = mapSources(source.selectors, Selector, this)
    this.openInTimeline = source.openInTimeline
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      params: this.params.map(param => param.serialize()),
      selectors: this.selectors.map(selector => selector.serialize()),
      openInTimeline: this.openInTimeline,
    }
  }
}

export class Timeline {
  constructor() {constructor.apply(this, arguments)}

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
  @observable currentTrackId: string = ''

  @observable inlineEaseEditor = {
    top: 0,
    height: 0,
    targetKey: null,
    controlledEases: [],
  }

  @observable parent: Project = null
  @observable get parentProject() {return findParent(this, Project)}

  _deserialize(source) {
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
    this.tracks = mapSources(source.tracks, Track, this)
    this.currentTrackId = source.currentTrackId
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
      currentTrackId: this.currentTrackId,
    }
  }

  getProductionSource() {
    return {
      name: this.name,
      tracks: this.tracks.map(timeline => timeline.serialize())
    }
  }
}

export class Project {
  constructor() {constructor.apply(this, arguments)}

  @observable id: string = ''
  @observable name: string = 'project'
  @observable timelines: Array<Timeline> = []
  @observable currentTimelineId: string = 'project'
  //only runtime
  @observable previewNodes: Array<object> = []

  @observable get currentTimeline(): ?Project {
    const {timeline, currentTimelineId} = this
    return this.timelines.find(({id}) => id === currentTimelineId) || null
  }

  _deserialize(source) {
    this.id = source.id
    this.name = source.name
    this.timelines = mapSources(source.timelines, Timeline, this)
    this.currentTimelineId = source.currentTimelineId
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      timelines: this.timelines.map(timeline => timeline.serialize()),
      currentTimelineId: this.selectedTimelineId,
    }
  }
}
