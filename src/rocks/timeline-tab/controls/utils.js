import find from 'lodash/collection/find'

export function getParentTrack(connect) {
  return find(connect.path, model => model.type === 'track')
}

export function getParentTimeline(connect) {
  return find(connect.path, model => model.type === 'timeline')
}
