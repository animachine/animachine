import getItemById from '../../selectors'

export function recurseKeys({keyHolderId, callback}) {
  recurseParams({keyKolderId, callback: param => {
    param.keys.forEach(keyId => callback(getItemById({id: keyId})))
  }})
}

export function recurseParams({keyHolderId, callback}) {
  const keyHolder = getItemById({id: keyHolderId})

  if (keyHolder.type === 'param') {
    callback(keyHolder)
  }

  if (keyHolder.tracks.forEach) {
    keyHolder.tracks.forEach(
      track => recurseParams({keyHolderId: track, callback})
    )
  }

  if (keyHolder.params.forEach) {
    keyHolder.params.forEach(
      param => recurseParams({keyHolderId: param, callback})
    )
  }
}
