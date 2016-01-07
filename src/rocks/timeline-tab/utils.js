export function convertPositionToTime(timeline, position) {
  const {pxpms, start} = timeline
  const time = position / pxpms
  return time - start
}

export function convertTimeToPosition(timeline, time) {
  const {start, pxpms} = timeline
  return (time + start) * pxpms
}

export function getVisibleTime(timeline) {
  return timeline.width / timeline.pxpms
}

//binary search closest index
// export function bsci(arr, target) {
//   var start = 0
//   var end = arr.length - 1
//   var position = ~~(end / 2)
// var sz = 0
//   while (
//     arr[position] !== target &&
//     start !== end &&
//     ++sz < 100
//   ) {
//     if (arr[position] < target) {
//       start = position + 1
//     }
//     else {
//       end = position - 1
//     }
//     position = ~~((start + end) / 2)
//     console.log({start, end, position})
//   }
//   return position
// }

//TODO make this faster using binary search
export function closestNumber(arr, target) {
  let result
  let diff
  for (let i = 0; i < arr.length; ++i) {
    const nextDiff = Math.abs(arr[i] - target)
    if (diff === undefined || nextDiff < diff) {
      diff = nextDiff
      result = arr[i]
    }
    else {
      return result
    }
  }
  return result
}

// export function forEachEndParam({keyHolder, callback}) {
//   function handle(item) {
//     if (item.type === 'track') {
//       item.params.forEach(handle)
//     }
//     else if (item.type === 'param') {
//       if (item.params.length) {
//         item.params.forEach(handle)
//       }
//       else {
//         callback(param)
//       }
//     }
//   }
//
//   handle(keyHolder)
// }
//
// export function forEachKey({keyHolder, callback}) {
//   forEachEndParam({keyHolder, callback: param => {
//     param.keys.forEach(callback)
//   }})
// }
//
// export function getNextKey({timeline, keyHolder}) {
//   const {currentTime} = timeline
//   let result
//   forEachKeys({keyHolder, callback: key => {
//     if (key.time > currentTime) {
//       if (!result || result.time > key.time) {
//         result = time
//       }
//     }
//   }})
//   return result
// }
//
// export function findPreviewKey({keyHolder, timeline}) {
//   const {currentTime} = timeline
//   let result
//   forEachKeys({keyHolder, callback: key => {
//     if (key.time < currentTime) {
//       if (!result || result.time < key.time) {
//         result = time
//       }
//     }
//   }})
//   return result
// }
//
// export function hasKeyNow({keyHolder, timeline}) {
//   const {currentTime} = timeline
//   let allHaveKey = true
//   forEachEndParam({keyHolder, callback: param => {
//     if (!param.keys.find(key => key.time === currentTime)) {
//       allHaveKey = false
//     }
//   }})
//   return allHaveKey
// }
