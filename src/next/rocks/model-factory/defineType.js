export default function defineType(Class) {
  const proto = Class.prototype
  proto.modelType = proto.constructor.name
  return Class
}
