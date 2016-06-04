

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
