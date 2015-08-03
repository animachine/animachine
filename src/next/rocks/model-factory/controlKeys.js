export default function (ModelClass) {
  ModelClass.prototype.selectKeysAtTime = function (time) {}
  ModelClass.prototype.toggleKeysSelectionAtTime = function (time) {}
  ModelClass.prototype.translateSelectedKeys = function (keys, offset) {}
}
