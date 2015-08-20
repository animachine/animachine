export default function defineType(Class) {
  const proto = Class.prototype
  proto.type = proto.constructor.name
  return Class
}
