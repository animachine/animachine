import {Track} from './models'
import {createEaser} from 'react-animachine-enhancer'

export function getValueOfTrackAtTime(
  track: Track,
  name: string,
  value: string,
  time: number
) {
  const param: Param = track.params.find(param => param.name === name)
  if (param) {
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
}

export getTimelineLength(timeline: Timeline) {
  let result = 0

  recurseKeys(timeline, key => {
    if (key.time > result) {
      result = key.time
    }
  })

  return result
}

function getParent(Type: Class, item: object) {

}

export function getTargetNodesOfTrack(track) {
  const {id: projectId} = getParentProjectOfTrack({trackId})
  const track = getItemById({id: trackId})
  const previewComponents = getPreviewComponentsOfProject({projectId})
  let result = []

  track.selectors.forEach(selector => {
    previewComponents.forEach(previewComponent => {
      const combinedSelector = combineSelector(selectorId)
      const target = createTarget(previewComponent.__itemTree)
        .findWithCommands(combinedSelector)

      result = [...result, ...target]
    })
  })

  return result
}