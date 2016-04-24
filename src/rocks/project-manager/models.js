import {defineModel, createModel} from 'afflatus'
import {registerId, createId} from './id-store'
import {createEaser} from 'animachine-connect'

import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import pick from 'lodash/pick'
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

function load(target, source, names) {
  names.forEach(name => {
    if (source.hasOwnProperty(name)) {
      target[name] = source[name]
    }
  })
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

defineModel({
  type: 'Project',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed project'},
    currentTimeline: {type: 'Timeline', canBeNull: true},
  },
  arrayValues: {
    timelines: {type: 'Timeline'}
  }
})

defineModel({
  type: 'Timeline',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed timeline'},
    isPlaying: {type: 'boolean', defaultValue: false},
    isSeeking: {type: 'boolean', defaultValue: false},
    currentTime: {type: 'number', defaultValue: 0},
    length: {type: 'number', defaultValue: 60000},
    pxpms: {type: 'number', defaultValue: 1},
    width: {type: 'number', defaultValue: 2000},
    start: {type: 'number', defaultValue: 0},
    startMargin: {type: 'number', defaultValue: 6},
  },
  arrayValues: {
    tracks: {type: 'Track'},
    previews: {},
  },
  computedValues: {
    animationSource() {
      return {
        tracks: this.tracks.map(track => track.animationSource)
      }
    }
  },
  untrackedValues: {
    registerPreview(rootTarget, gsapAnimation) {
      this.previews.push({rootTarget, gsapAnimation})
    },
    addTrack(source) {
      const track = createModel('Track', source, this)
      this.tracks.push(track)
      return track
    }
  }
})

defineModel({
  type: 'Track',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed track'},
    openInTimeline: {type: 'boolean', defaultValue: true}
  },
  arrayValues: {
    params: {type: 'Param'},
    selectors: {type: 'Selector'},
  },
  computedValues: {
    keyTimes() {
      return uniq(flatten(this.params.map(param => param.keyTimes))).sort(sortNum)
    },
    animationSource() {
      return {
        params: this.params.map(param => param.animationSource),
        selectors: this.selectors.map(selector => selector.animationSource),
      }
    }
  }
})

defineModel({
  type: 'Selector',
  simpleValues: {
    selectorType: {type: 'string', defaultValue: 'css'},
    query: {type: 'string', defaultValue: ''},
  },
  computedValues: {
    animationSource() {
      return pick(this, ['selectorType', 'query'])
    }
  },
})

defineModel({
  type: 'Param',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed param'},
    openInTimeline: {type: 'boolean', defaultValue: true}
  },
  arrayValues: {
    keys: {type: 'Key'},
  },
  computedValues: {
    keyTimes() {
      return this.keys.map(key => key.time).sort(sortNum)
    },
    currentValue() {
      return getValueOfParamAtTime(this, this.parent('Timeline').currentTime)
    },
    animationSource() {
      return {
        keys: this.keys.map(key => key.animationSource)
      }
    },
  }
})

defineModel({
  type: 'Key',
  simpleValues: {
    time: {type: 'int',  defaultValue: 0},
    value: {type: 'string',  defaultValue: '0'},
    ease: {type: 'Ease',  defaultValue: null},
    selected: {type: 'boolean',  defaultValue: false},
  },
  computedValues: {
    animationSource() {
      return {
        time: this.time,
        value: this.value,
        ease: this.ease.animationSource,
      }
    }
  }
})

defineModel({
  type: 'Ease',
  simpleValues: {
    easeType: {type: 'string', defaultValue: 'bezier'},
    pointAX: {type: 'number', defaultValue: 0.3},
    pointAY: {type: 'number', defaultValue: 0.3},
    pointBX: {type: 'number', defaultValue: 0.7},
    pointBY: {type: 'number', defaultValue: 0.7},
    roughEase: {type: 'number', defaultValue: false},
    roughStrength: {type: 'number', defaultValue: 1},
    roughPoints: {type: 'number', defaultValue: 20},
    roughClamp: {type: 'boolean', defaultValue: false},
    roughRandomise: {type: 'boolean', defaultValue: true},
    roughTaper: {type: 'string', defaultValue: 'none'},
  },
  computedValues: {
    easer() {return createEaser(this)},
    animationSource() {
      return pick(this, [
        'easeType', 'pointAX', 'pointAY', 'pointBX', 'pointBY',
        'roughEase','roughStrength', 'roughPoints', 'roughClamp',
        'roughRandomise', 'roughTaper',
      ])
    }
  },
})
