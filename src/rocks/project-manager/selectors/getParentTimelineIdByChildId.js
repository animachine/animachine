import {getItems, getItemById} from './index'

export function getParentTimelineIdByChildId({childId}) {
  function testTimeline(timeline) {
    let result = false

    walk(timeline, handleItem)

    function handleItem(item) {
      if (item.id === childId) {
        result = true
      }

      if (!result) {
        walk(item, handleItem)
      }
    }

    return result
  }

  function walk(item, callback) {
    switch (item.type) {
      case 'timeline':
        return forEachItem(item.tracks, callback)
      case 'track':
        return forEachItem(item.params, callback)
      case 'param':
        return forEachItem(item.keys, callback)
    }
  }

  function forEachItem(idList, callback) {
    idList.forEach(id => callback(getItemById({id})))
  }

  const timeline = getItems().find(item => {
    return item.type === 'timeline' && testTimeline(item)
  })

  return timeline.id
}
