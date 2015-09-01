export function convertPositionToTime({timeline, position}) {
  const {width, pxpms, start} = timeline
  const time = position / width
  const visibleTime = width / pxpms
  return (time * visibleTime) - start
}

export function convertTimeToPosition({timeline, time}) {
  const {start, pxpms} = timeline
  return (time + start) / pxpms
}

export function getVisibleTime({timeline}) {
  return timeline.width / timeline.pxpms
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
