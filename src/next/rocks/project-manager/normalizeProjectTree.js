import omit from 'lodash/object/omit'
import isUndefined from 'lodash/lang/isUndefined'
import createItem from './createItem'

export default function (projectTree) {
  let items = []

  const createNormalizer = (type, mod) => tree => {
    const spec = omit(mod(tree), isUndefined)
    const item = createItem({type, data: {...tree, ...spec}})
    items.push(Object.freeze(item))
    return item.id
  }

  const map = (items, normalizer) => {
    return items && items.map(normalizer)
  }

  const normalizeEase = createNormalizer('ease', tree => ({}))
  const normalizeKey = createNormalizer('key', tree => ({
    ease: normalizeEase(tree.ease)
  }))
  const normalizeParam = createNormalizer('param', tree => ({
    keys: map(tree.keys, normalizeKey),
    params: map(tree.params, normalizeParam)
  }))
  const normalizeTrack = createNormalizer('track', tree => ({
    params: map(tree.params, normalizeParam)
  }))
  const normalizeTimeline = createNormalizer('timeline', tree => ({
    tracks: map(tree.tracks, normalizeTrack)
  }))
  const normalizeProject = createNormalizer('project', tree => ({
    timelines: map(tree.timelines, normalizeTimeline)
  }))

  normalizeProject(projectTree)
  let project = items[items.length - 1]

  //if there is no current timeline set the first
  if (!project.currentTimelineId) {
    const timeline = items.find(item => item.type === 'timeline')
    if (timeline) {
      project = {...project, currentTimelineId: timeline.id}
      items = [...items.slice(0, items.length - 1), project]
    }
  }

  console.log('normalizer', {items, projectId: project.id})
  return {items, projectId: project.id}
}
