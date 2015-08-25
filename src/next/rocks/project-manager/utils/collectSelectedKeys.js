import {recurseKeys} from './recursers'

export function collectSelectedKeys({keyHolderId}) {
  const result = []
  recurseKeys({keyHolderId, callback: key => {
    if (key.selected) {
      result.push(key)
    }
  }})
  return result
}
