import {recurseKeys} from './recursers'

export function getKeysAtTime({keyHolderId, time}) {
  const result = []
  recurseKeys({keyHolderId, callback: key => {
    if (key.time === time) {
      result.push(key)
    }
  }})
  return result
}
