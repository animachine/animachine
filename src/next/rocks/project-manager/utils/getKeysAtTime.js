import {recurseKeys} from './recursers'

export function getKeysAtTime({projectManager, keyHolderId, time}) {
  const result = []
  recurseKeys({projectManager, keyHolderId, callback: key => {
    if (key.time === time) {
      result.push(key)
    }
  }})
  return result
}
