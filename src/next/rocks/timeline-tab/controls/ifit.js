export default function (str) {
  const rx = new RegExp('(^|,)'+str+'(,|$)')
  const ret = {
    is: (cases, cb) => {
      if (cases.match(rx)) {
        cb()
      }
      return ret
    },
  }
  return ret
}
