import {defineModel, createModel, transaction} from 'afflatus'
import {createEaser, createTargets} from 'animachine-connect'
import {recurseKeys} from './recursers'

import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import pick from 'lodash/pick'
import remove from 'lodash/remove'
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

function findParent(item, ParentClass) {
  let parent = item.parent
  while (parent) {
    if (parent instanceof ParentClass) {
      return parent
    }
    parent = parent.parent
  }
}

function getHistory(item) {
  return item.parent('Project').history
}

export function createAdder(type, storeName) {
  let history

  return function (source) {
    if (!history) {
      history = getHistory(this)
    }

    return history.save(
      () => {
        const item = createModel(type, source, this)
        this[storeName].push(item)
        return item
      },
      () => remove(this[storeName], item),
    )
  }
}

export function createRemover(storeName) {
  let history

  return function (item) {
    if (!history) {
      history = getHistory(this)
    }

    return history.save(
      () => remove(this[storeName], item),
      () => this[storeName].push(item),
    )
  }
}

function createSetter(paramName) {
  let history

  return function (value) {
    if (!history) {
      history = getHistory(this)
    }

    const oldValue = this[paramName]

    if (oldValue === value) {
      return
    }

    return history.save(
      () => this[paramName] = value,
      () => this[paramName] = oldValue,
    )
  }
}

export class HistoryFlag {
  constructor(pair) {
    this.pair = pair || new HistoryFlag(this)
  }
  isPair(pair) {
    return this.pair === pair
  }
}

export class HistoryReg {
  constructor(redo, undo) {
    this.undo = undo
    this.redo = redo
  }
}


defineModel({
  type: 'History',
  simpleValues: {
    position: {defaultValue: -1}
  },
  arrayValues: {
    stack: {}
  },
  untrackedValues: {
    save(redo, undo) {
      this.push(new HistoryReg(redo, undo))
      return redo()
    },
    push(item) {
      this.stack.splice(this.position + 1)
      this.stack.push(item)
      this.position += 1
    },
    startFlag() {
      const flag = new HistoryFlag()
      this.push(flag)
      return () => this.push(flag.pair)
    },
    wrap(fn) {
      const endFlag = this.startFlag()
      const result = transaction(() => fn())
      endFlag()
      return result
    },
    undo() {
      if (this.position < 0) {
        return
      }
      const stepBack = () => {
        const item = this.stack[this.position--]
        if (item.undo) {
          item.undo()
        }
        return item
      }

      transaction(() => {
        const item = stepBack()
        if (item instanceof HistoryFlag) {
          const pairIndex = this.stack.indexOf(item.pair)
          if (pairIndex <= this.position && pairIndex !== -1) {
            while (this.position >= pairIndex) {
              stepBack()
            }
          }
        }
      })
    },
    redo() {
      if (this.position >= this.stack.length - 1) {
        return
      }
      const stepForward = () => {
        const item = this.stack[++this.position]
        if (item.redo) {
          item.redo()
        }
        return item
      }

      transaction(() => {
        const item = stepForward()
        if (item instanceof HistoryFlag) {
          const pairIndex = this.stack.indexOf(item.pair)
          if (pairIndex >= this.position && pairIndex !== -1) {
            while (this.position < pairIndex) {
              stepForward()
            }
          }
        }
      })
    }
  }
})

defineModel({
  type: 'Project',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed project'},
    currentTimeline: {type: 'Timeline', canBeNull: true},
    history: {type: 'History', dontSerialise: true}
  },
  arrayValues: {
    timelines: {type: 'Timeline'}
  },
  untrackedValues: {
    addTimeline:  ('Timeline', 'timelines')
  }
})

defineModel({
  type: 'Timeline',
  simpleValues: {
    name: {type: 'string', defaultValue: 'unnamed timeline'},
    currentTrack: {type: 'Track', canBeNull: true},
    isPlaying: {type: 'boolean', defaultValue: false},
    isSeeking: {type: 'boolean', defaultValue: false},
    currentTime: {type: 'number', defaultValue: 0},
    length: {type: 'number', defaultValue: 60000},
    pxpms: {type: 'number', defaultValue: 1},
    width: {type: 'number', defaultValue: 2000},
    start: {type: 'number', defaultValue: 0},
    startMargin: {type: 'number', defaultValue: 6},
    inlineEaseEditor: {type: 'object', defaultValue: null, dontSerialise: true},
  },
  arrayValues: {
    tracks: {type: 'Track'},
    previews: {dontSerialise: true},
  },
  computedValues: {
    animationSource() {
      return {
        name: this.name,
        tracks: this.tracks.map(track => track.animationSource)
      }
    },
    lastKeyTime() {
      let result = 0
      recurseKeys(this, key => {
        if (key.time > result) {
          result = key.time
        }
      })
      return result
    }
  },
  untrackedValues: {
    registerPreview(rootTarget, gsapAnimation) {
      this.previews.push({rootTarget, gsapAnimation})
    },
    addTrack: createAdder('Track', 'tracks'),
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
    },
    targets() {
      const track = this
      const {previews} = track.parent('Timeline')
      const result = []

      for (let i = 0; i < previews.length; ++i) {
        for (let j = 0; j < track.selectors.getLength(); ++j) {
          const targets = createTargets(
            previews[i].rootTarget,
            track.selectors[j]
          )
          result.push(...targets)
        }
      }
      return result
    }
  },
  untrackedValues: {
    addParam: createAdder('Param', 'params'),
    removeParam: createRemover('params'),
    addSelector: createAdder('Selector', 'selectors'),
    removeSelector: createRemover('selectors'),
    setValueAtTime(paramName, value, time) {
      getHistory(this).wrap(() => {
        let param = this.params.find(param => param.name === paramName)
        if (!param) {
          param = this.addParam({name: paramName})
        }
        param.setValueAtTime(value, time)
      })
    },
  },
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
        keys: this.keys.map(key => key.animationSource),
        name: this.name,
      }
    },
  },
  untrackedValues: {
    addKey: createAdder('Key', 'keys'),
    removeKey: createRemover('keys'),
    setValueAtTime(value, time) {
      getHistory(this).wrap(() => {
        let key = this.keys.find(key => key.time === time)
        if (!key) {
          key = this.addKey({time})
        }
        key.setValue(value)
      })
    }
  }
})

defineModel({
  type: 'Key',
  simpleValues: {
    time: {type: 'int',  defaultValue: 0},
    value: {type: 'string',  defaultValue: '0'},
    ease: {type: 'Ease',  defaultValue: {}},
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
  },
  untrackedValues: {
    setTime: createSetter('time'),
    setValue: createSetter('value'),
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
