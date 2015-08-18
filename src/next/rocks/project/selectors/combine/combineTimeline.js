const store = BETON.getRock('store')


const mapEase = (items, itemId) => findItemById({itemId})

const mapKey = (items, itemId) => {
  const key = findItemById({itemId})
  return combine(key, {
    ease: mapEase(items, key.ease)
  })
}

const mapParam = (items, itemId) => {
  let param = findItemById({itemId})
  return combine(param, {
    params: param.params.map(paramId => mapParam(items, itemId))
    keys: param.keys.map(keyId => mapKey(items, itemId))
  })
}

const mapTrack = (items, itemId) => {
  const track = findItemById({itemId})
  return combine(track, {
    params: track.params.map(paramId => mapParam(items, itemId))
  })
}

const mapTimeline = (items, itemId) => {
  const timeline = findItemById({itemId})
  return combine(timeline, {
    tracks: timeline.tracks.map(trackId => mapTrack(items, itemId))
  })
}

const itemsSelector = state => state.items
const currentProjectSelector = state =>
  findItemById({itemId: state.currentProjectId})
const currentTimelineSelector = createSelector(
  [itemsSelector, currentProjectSelector],
  (items, currentProject) =>
    findItemById(items, currentProject.currentTimelineId)
)
const currentTimelineSelector = createSelector(
  [itemsSelector, currentTimelineSelector],
  (items, currentTimeline) => {
    return {
      ...currentTimeline,
      tracks: currentTimeline.tracks.map(trackId => mapTrack(items, itemId))
    }
  }
)
const mapTimelineData (items, project) => {
  const currentTimeline = findItemById(items, project.currentTimelineId)
  return {
    ...currentTimeline,
    tracks: currentTimeline.tracks.map(trackId => mapTrack(items, itemId))
  }
}

export default createSelector(
  [itemsSelector, currentTimelineSelector],
  mapTimelineData
)
