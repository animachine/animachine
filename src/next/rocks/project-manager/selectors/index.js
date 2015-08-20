import {createEaser} from 'react-animachine-enhancer'
const store = BETON.getRock('store')

export * from './combine'

export function getProjectManager () {
  return store.getState().projectManager
}

export function getItems () {
  return getProjectManager().items
}

export function getItemById({id}) {
  return getItems().find(item => item.id === id)
}

export function getCurrentProjectId() {
  return getProjectManager().currentProjectId
}

export function getCurrentTimelineId() {
  const project = getItemById({id: getCurrentProjectId()})
  return project && project.currentTimelineId
}

export function getCurrentTimeline() {
  return getItemById({id: getCurrentTimelineId()})
}

export function getParamValueAtTime({paramId, time}) {
  const param = getItemById({id: paramId})
  let previousKey, nextKey, rightKey
  param.keys && param.keys.forEach(key => {
    if (key.time === time) {
      rightKey = key
    }
    else if (key.time < time) {
      if (!previousKey) {
        previousKey = key
      }
      else if (previousKey.time < key.time) {
        previousKey = key
      }
    }
    else if (key.time > time) {
      if (!nextKey) {
        nextKey = key
      }
      else if (nextKey.time > key.time) {
        nextKey = key
      }
    }
  })

  if (rightKey) {
    return rightKey.value
  }
  else {
    if (previousKey && nextKey) {
      const fullTime = nextKey.time - previousKey.time
      const percent = (time - previousKey.time) / fullTime
      const easer = createEaser(nextKey.ease)
      const ratio = easer.getRatio(percent)
      return previousKey.value + (nextKey.value - previousKey.value) * ratio
    }
    else if (previousKey) {
      return previousKey.value
    }
    else if (nextKey) {
      return nextKey.value
    }
    else {
      return 0
    }
  }
}

export function getHighestItemId () {
  let result = 0
  getItems().forEach(item => {
    if (item.id > result) {
      result = item.id
    }
  })
  return result
}

export function findClosestKey({keyHolder, time}) {
  let result
  recurseKeys({keyHolder, fn: key => {
      if (key.time > time) {
        if (!result) {
          result = key
        }
        else {
          const diffA = Math.abs(result.time - time)
          const diffB = Math.abs(key.time - time)

          if (diffB < diffA) {
            result = key
          }
        }
      }
    }
  })
  return result
}

export function collectSelectedKeys() {
  const result = []
  this.forEachSelectedKey(key => result.push(key))
  return result
}

export function recurseKeys({keyHolder, fn}) {
  if (keyHolder.keys.forEach) {
    keyHolder.keys.forEach(key => fn(key, keyHolder))
  }

  if (keyHolder.tracks.forEach) {
    keyHolder.tracks.forEach(track => recurseKeys(track, fn))
  }

  if (keyHolder.params.forEach) {
    keyHolder.params.forEach(param => recurseKeys(param, fn))
  }
}

export function recurseParams({keyHolder, fn}) {
  if (keyHolder.type === 'param') {
    fn(keyHolder)
  }

  if (keyHolder.tracks.forEach) {
    keyHolder.tracks.forEach(track => recurseParams(track, fn))
  }

  if (keyHolder.params.forEach) {
    keyHolder.params.forEach(param => recurseParams(param, fn))
  }
}
