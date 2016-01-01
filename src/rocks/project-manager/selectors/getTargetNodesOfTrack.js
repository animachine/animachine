import {
  getItemById,
  combineSelector,
  getPreviewComponentsOfProject,
  getParentProjectOfTrack
} from '../selectors'

import {createTarget} from 'animachine-connect'

export function getTargetNodesOfTrack({trackId}) {
  const {id: projectId} = getParentProjectOfTrack({trackId})
  const track = getItemById({id: trackId})
  const previewComponents = getPreviewComponentsOfProject({projectId})
  let result = []

  track.selectors.forEach(selectorId => {
    previewComponents.forEach(previewComponent => {
      const combinedSelector = combineSelector(selectorId)
      const target = createTarget(previewComponent.__itemTree)
        .findWithCommands(combinedSelector)

      result = [...result, ...target]
    })
  })

  return result
}
