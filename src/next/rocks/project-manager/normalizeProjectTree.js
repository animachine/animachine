import {getHighestId} from './selectors'

export default function (projectTree) {
  let lastId = getHighestId()
  const items = []

  const createNormalizer = mod => tree => {
    const id = ++lastId
    items.push({...tree, ...mod(tree), id})
    return id
  }

  const normalizeEase = createNormalizer(tree => ({}))
  const normalizeKey = createNormalizer(tree => ({
    ease: normalizeEase(tree.ease)
  }))
  const normalizeParam = createNormalizer(tree => ({
    keys: tree.keys.map(normalizeKey),
    params: tree.params.map(normalizeParam)
  }))
  const normalizeTrack = createNormalizer(tree => ({
    params: tree.params.map(normalizeParam)
  }))
  const normalizeTimeline = createNormalizer(tree => ({
    tracks: tree.tracks.map(normalizeTrack)
  }))
  const normalizeProject = createNormalizer(tree => ({
    timelines: tree.timelines.map(normalizeTimeline)
  }))

  return items
}
