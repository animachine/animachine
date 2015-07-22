export default function defineGetSource(proto, name, func) {
  const superFunc = proto.getSource
  proto.getSource = function (source = {}) {
    if (superFunc) {
      superFunc.call(this, source)
    }
    func.call(this, source)
  }
}
