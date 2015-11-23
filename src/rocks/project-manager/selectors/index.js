import {createEaser} from 'react-animachine-enhancer'
import {
  recurseParams,
  recurseKeys,
} from '../utils'

export * from './combine'
export * from './getKeysAtTime'
export * from './collectSelectedKeys'
export * from './getParamsOfTimeline'
export * from './getParent_of_'
export * from './getParentTimelineIdByChildId'
export * from './getTargetNodesOfTrack'
export * from './getTimelineLength'

export function getProjectManager({projectManager} = {}) {
  const store = BETON.require('store')
  return projectManager || store.getState().projectManager
}

export function getItems({projectManager} = {}) {
  return getProjectManager({projectManager}).items
}

export function getItemById({projectManager, id}) {
  return getItems({projectManager}).find(item => item.id === id)
}

export function getCurrentProjectId({projectManager} = {}) {
  return getProjectManager({projectManager}).currentProjectId
}

export function getCurrentProject({projectManager} = {}) {
  const currentProjectId = getCurrentProjectId({projectManager})
  return getItemById({projectManager, id: currentProjectId})
}

export function getCurrentTimelineId({projectManager} = {}) {
  const project = getCurrentProject({projectManager})
  return project && project.currentTimelineId
}

export function getCurrentTimeline({projectManager} = {}) {
  const currentTimelineId = getCurrentProjectId({projectManager})
  return getItemById({id: getCurrentTimelineId()})
}

export function getValueOfParamAtTime({projectManager, paramId, time}) {
  const param = getItemById({projectManager, id: paramId})
  let previousKey, nextKey, rightKey
  param.keys && param.keys.forEach(keyId => {
    const key = getItemById({projectManager, id: keyId})

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
      const ease = getItemById({projectManager, id: nextKey.ease})
      const easer = createEaser(ease)
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

export function getKeyOfParamAtTime({projectManager, paramId, time}) {
  const param = getItemById({projectManager, id: paramId})
  const keyId = param.keys.find(id =>
    getItemById({projectManager, id}).time === time
  )
  if (keyId) {
    return getItemById({projectManager, id: keyId})
  }
}

export function getParamOfTrackByName({projectManager, trackId, paramName}) {
  let result
  recurseParams({projectManager, keyHolderId: trackId, callback: param => {
    if (param.name === paramName) {
      result = param
    }
  }})
  return result
}

export function getPreviewComponentsOfProject({projectManager, projectId}) {
  return getProjectManager({projectManager})
    .previewComponentsByProjectId[projectId]
}

export function getOriginalSourceOfProject({projectManager, projectId}) {
  return getProjectManager({projectManager})
    .originalSourcesByProjectId[projectId]
}

export function getClosestKey({projectManager, keyHolderId, time}) {
  let result
  recurseKeys({projectManager, keyHolderId, callback: key => {
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
  }})
  return result
}

export function getNextKey({projectManager, keyHolderId, time}) {
  let result
  recurseKeys({projectManager, keyHolderId, callback: key => {
    if (key.time > time && (!result || result.time > key.time)) {
      result = key
    }
  }})
  return result
}

export function getPreviousKey({projectManager, keyHolderId, time}) {
  let result
  recurseKeys({projectManager, keyHolderId, callback: key => {
    if (key.time < time && (!result || result.time < key.time)) {
      result = key
    }
  }})
  return result
}

export function getMaxTimelineStart({projectManager, timelineId}) {
  const timeline = getItemById({projectManager, id: timelineId})
  return timeline.startMargin / timeline.pxpms
}
