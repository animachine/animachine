export default function (nextKey, timeline) {
  var previousKey

  timeline.forEachKeys((key, param) => {
    if (key === nextKey) {
      param.forEachKey(childKey => {
        if (childKey.time < nextKey.time) {
          if(!previousKey) {
            previousKey = childKey
          }
          else if (previousKey.time < nextKey.time) {
            previousKey = nextKey
          }
        }
      })
    }
  })

  return previousKey
}
