import {getItemById} from '../selectors'

export function recurseKeys({projectManager, keyHolderId, callback}) {
  recurseParams({projectManager, keyHolderId, callback: param => {
    param.keys.forEach(keyId => callback(getItemById({
      projectManager,
      id: keyId
    })))
  }})
}

export function recurseParams({projectManager, keyHolderId, callback}) {
  const keyHolder = getItemById({projectManager, id: keyHolderId})

  if (keyHolder.type === 'param') {
    callback(keyHolder)
  }

  if (keyHolder.tracks) {
    keyHolder.tracks.forEach(
      track => recurseParams({projectManager, keyHolderId: track, callback})
    )
  }

  if (keyHolder.params) {
    keyHolder.params.forEach(
      param => recurseParams({projectManager, keyHolderId: param, callback})
    )
  }
}
