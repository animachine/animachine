import {recurseParams} from '../utils/recursers'

export function getParamsOfTimeline({timelineId, projectManager}) {
  const result = []
  recurseParams({projectManager, keyHolderId: timelineId, callback: param => {
    result.push(param)
  }})
  return result
}
