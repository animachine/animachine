import {getItems, getItemById} from '../index.js'

export function getParentTimelineIdByChildId({id}) {
  const timeline = getItems.find(item => {
    return item.type === 'timeline' && testTimeline(item)
  })

  return timeline.id

  function testTimeline(timeline) {
    let result = false

    walk(timeline, handleItem)

    function handleItem(item) {
      if (item.id === id) {
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
      forEachItem(item.tracks, callback)
    }
  }

  function forEachItem(idList, callback) {
    idList.forEach(id => callback(getItemById(id)))
  }
}
