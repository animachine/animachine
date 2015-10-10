import {recurseKeys} from '../utils/recursers'

export function getTimelineLength({timelineId}) {
  let result = 0

  recurseKeys({keyHolderId: timelineId, callback: (key) => {
    if (key.time > result) {
      result = key.time
    }
  }})

  return result
}
