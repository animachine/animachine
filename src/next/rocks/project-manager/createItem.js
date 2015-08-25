const defaults = {
  ease: {
    easeType: 'bezier',
    pointAX: 0,
    pointAY: 0,
    pointBX: 1,
    pointBY: 1,
    roughEase: false,
    roughStrength: 1,
    roughPoints: 20,
    roughClamp: false,
    roughRandomise: true,
    roughTaper: 'none',
  },
  key: {
    time: 0,
    value: 0,
    selected: false,
  },
  param: {
    name: '',
    openInTimeline: true,
    params: [],
    keys: []
  },
  track: {
    name: '',
    selectors: [],
    openInTimeline: true,
    params: []
  },
  timeline: {
    name: '',
    isPlaying: false,
    currentTime: 0,
    length: 60000,
    timescale: 1,
    width: 2000,
    start: 0,
    startMargin: 6,
    tracks: [],
    inlineEaseEditor: false,
  },
  project: {
    currentTimelineId: undefined,
    timelines: []
  },
}

let lastId = 0

export default function createItem({type, data}) {
  return {
    ...defaults[type],
    ...data,
    id: ++lastId,
    type
  }
}
