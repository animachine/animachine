const defaults = {
  ease: {
    easeType: 'bezier',
    pointAX: 0.3,
    pointAY: 0.3,
    pointBX: 0.7,
    pointBY: 0.7,
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
    selectors: [[]],
    openInTimeline: true,
    showThreeDimensionalParams: false,
    params: []
  },
  timeline: {
    name: '',
    isPlaying: false,
    currentTime: 0,
    length: 60000,
    pxpms: 1,
    width: 2000,
    start: 0,
    startMargin: 6,
    currentTrackId: undefined,
    inlineEaseEditor: false,
    tracks: [],
  },
  project: {
    currentTimelineId: undefined,
    timelines: []
  },
  selector: {
    selectorType: 'react-element',
    commands: []
  },
  selectorCommand: {
    commandType: 'find',
    params: []
  },
  selectorCommandParam: {
    key: '',
    value: '',
  }
}

let lastId = 0

export default function createItem({type, data}) {
  return {
    ...defaults[type],
    ...data,
    id: (++lastId).toString(),
    type
  }
}
