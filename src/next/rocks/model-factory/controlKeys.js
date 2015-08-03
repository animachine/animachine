export default function (ModelClass) {
  ModelClass.prototype.selectKeysAtTime = function (time) {
    recurseKeys(this, (key, param) => {
      if (key.time === time) {
        param.selectKey(key)
      }
    })
  }

  ModelClass.prototype.toggleKeysSelectionAtTime = function (time) {
    var hasSelected = false
    recurseKeys(this, (key, param) => {
      if (key.time === time && param.isSelectedKey(key)) {
        hasSelected = true
      }
    })

    recurseKeys(this, (key, param) => {
      if (key.time === time) {
        if (hasSelected) {
          param.deselectKey(key)
        }
        else {
          param.selectKey(key)
        }
      }
    })
  }

  ModelClass.prototype.translateSelectedKeys = function (offset) {
    recurseKeys(this, (key, param) => {
      if (param.isSelectedKey(key)) {
        key.time += offset
      }
    })
  }

  ModelClass.prototype.deselectAllKeys = function () {
    recurseParams(param => param.deselectAllKeys())
  }
}

function recurseKeys(model, fn) {
  if (model.forEachKeys) {
    model.forEachKeys(fn)
  }

  if (model.forEachTrack) {
    model.forEachTrack(track => recurseKeys(track, fn))
  }

  if (model.forEachParam) {
    model.forEachParam(param => recurseKeys(param, fn))
  }
}

function recurseParams(model, fn) {
  if (model.modelType === 'Param') {
    fn(model)
  }

  if (model.forEachTrack) {
    model.forEachTrack(track => recurseParams(track, fn))
  }

  if (model.forEachParam) {
    model.forEachParam(param => recurseParams(param, fn))
  }
}
