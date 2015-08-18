export function recurseKeys(model, fn) {
  if (model.forEachKey) {
    model.forEachKey(key => fn(key, model))
  }

  if (model.forEachTrack) {
    model.forEachTrack(track => recurseKeys(track, fn))
  }

  if (model.forEachParam) {
    model.forEachParam(param => recurseKeys(param, fn))
  }
}

export function recurseParams(model, fn) {
  if (model.modelType === 'param') {
    fn(model)
  }

  if (model.forEachTrack) {
    model.forEachTrack(track => recurseParams(track, fn))
  }

  if (model.forEachParam) {
    model.forEachParam(param => recurseParams(param, fn))
  }
}
