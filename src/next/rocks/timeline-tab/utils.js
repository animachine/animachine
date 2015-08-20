export function convertPositionToTime({timeline, position}) {
  const {width, timescale, start} = timeline
  const time = position / width
  const visibleTime = width / timescale
  return (time * visibleTime) - start
}

export function convertTimeToPosition({timeline, time}) {
  const {start, timescale} = timeline
  return (time + start) / timescale
}

export function getVisibleTime({timeline}) {
  return timeline.width * timeline.timescale
}
