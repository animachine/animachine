import {recurseKeys} from './recursers'

export function collectSelectedKeys({projectManager, keyHolderId}) {
  const result = []
  recurseKeys({projectManager, keyHolderId, callback: key => {
    if (key.selected) {
      result.push(key)
    }
  }})
  return result
}
