import {
  getItems
} from '../selectors'

function createParentSelector(parentType, childContainerName, childId) {
  return item => item.type === parentType &&
    item[childContainerName].indexOf(childId) !== -1
}

export function getParentParamOfKey({keyId}) {
  return getItems().find(createParentSelector('param', 'keys', keyId))
}

export function getParentTrackOfParam({paramId}) {
  return getItems().find(createParentSelector('track', 'params', paramId))
}

export function getParentTimelineOfTrack({trackId}) {
  return getItems().find(createParentSelector('timeline', 'tracks', trackId))
}

export function getParentProjectOfTimeline({timelineId}) {
  return getItems().find(createParentSelector('project', 'timelines', timelineId))
}

export function getParentProjectOfTrack({trackId}) {
  const {id: timelineId} = getParentTimelineOfTrack({trackId})
  return getParentProjectOfTimeline({timelineId})
}
