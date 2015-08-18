import {
  SET_TIMELINE_CURRENT_TIME
} from './actions'
import {
  getItemById
} from './selectors'

const initialState = {
  currentTimelineId: undefined,
  items: []
}

export default function (project = initialState, action) {
  switch (action.type) {
    case SET_TIMELINE_CURRENT_TIME: {
      const {timelineId, time} = action
      const timeline = getItemById({project, id: timelineId})
      return replaceItem(project, timeline, {...timeline, currentTime: time})
    }
  }
}

function replaceItem({project, oldItem, newItem}) {
  const {items} = project
  const index = items.indexOf(oldItem)
  return {
    ...project,
    items: [
      ...items.slice(0, index),
      newItem,
      ...items.slice(index + 1)
    ]
  }
}
