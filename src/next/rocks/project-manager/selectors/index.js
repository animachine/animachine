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

export function findItemById ({id}) {
  return getItems().find(item => item.id = id)
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
  if (keyHolder.modelType === 'param') {
    fn(keyHolder)
  }

  if (keyHolder.tracks.forEach) {
    keyHolder.tracks.forEach(track => recurseParams(track, fn))
  }

  if (keyHolder.params.forEach) {
    keyHolder.params.forEach(param => recurseParams(param, fn))
  }
}
