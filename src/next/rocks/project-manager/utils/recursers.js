import {getItemById} from '../selectors'

export function recurseKeys({keyHolderId, callback}) {
  recurseParams({keyHolderId, callback: param => {
    param.keys.forEach(keyId => callback(getItemById({id: keyId})))
  }})
}

export function recurseParams({keyHolderId, callback}) {
  const keyHolder = getItemById({id: keyHolderId})

  if (keyHolder.type === 'param') {
    callback(keyHolder)
  }

  if (keyHolder.tracks) {
    keyHolder.tracks.forEach(
      track => recurseParams({keyHolderId: track, callback})
    )
  }

  if (keyHolder.params) {
    keyHolder.params.forEach(
      param => recurseParams({keyHolderId: param, callback})
    )
  }
}
