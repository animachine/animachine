export default function defineGetSource(proto, func) {
  if (!proto.sourceGetters) {
    proto.sourceGetters = []
  }

  if (!proto.getSource) {
    proto.getSource = function () {
      var source = {}
      proto.sourceGetters.forEach(sourceGetter => sourceGetter.call(this, source))
      return source
    }
  }

  proto.sourceGetters.push(func)
}
