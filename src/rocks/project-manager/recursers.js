

export function recurseKeys(root: object, cb: Function) {
  return recurseParams(root, param => {
    return param.keys.some(key => cb(key))
  })
}

export function recurseParams(root: object, cb: Function) {
  if (root.type === 'Timeline') {
    return root.tracks.some(track => recurseParams(track, cb))
  }
  else if (root.type === 'Track') {
    return root.params.some(param => cb(param))
  }
  else if (root.type === 'Param') {
    return cb(root)
  }
}

export function recurseKeyHolders(root: object, cb: Function) {
  if (cb(root) !== true) {
    return true
  }
  if (root.type === 'Timeline') {
    return root.tracks.some(track => recurseKeyHolders(track, cb))
  }
  if (root.type === 'Track') {
    return root.params.some(param => recurseKeyHolders(param, cb))
  }
}

export function recurseAll(
  root: object,
  cb: Function,
  path: Array<object> = []
) {
  if (cb(root) !== true) {
    return true
  }
  if (root.type === 'Project') {
    return root.timelines.some(timeline => recurseAll(timeline, cb))
  }
  if (root.type === 'Timeline') {
    return root.tracks.some(track => recurseAll(track, cb))
  }
  if (root.type === 'Track') {
    return root.params.some(param => recurseAll(param, cb))
      || root.selectors.some(selector => recurseAll(selector, cb))
  }
  if (root.type === 'Param') {
    return root.keys.some(key => recurseAll(key, cb))
  }
  if (root.type === 'Key') {
    return recurseAll(key, cb) || recurseAll(key.ease, cb)
  }
}
