export default function defineSetSource(proto, func) {
  const superFunc = proto.setSource
  proto.setSource = function (source) {
    if (superFunc) {
      superFunc.call(this, source)
    }
    func.call(this, source)
  }
}
