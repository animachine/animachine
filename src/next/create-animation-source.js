export default function createAnimationSource(timeline, project, connect) {
  var gsTimeline = new TimelineMax({repeat: -1})

  function addParams(params, targets) {
    var headTime = 0
    params.forEach(param => {
      if (param.keys) {

        param.keys.forEach(key => {
          var duration = key.time - headTime
          gsTimeline.to(targets, duration, {[param.name]: key.value}, headTime)

          headTime = key.time
        })

      }
      if (param.childParams) {
        addParams(param.childParams, targets)
      }
    })
  }

  timeline.tracks.forEach(track => {
    var targets = track.selectors.map(selector => {
      return connect.getTargetByKeys(selector)
    })

    addParams(track.params, targets)
  })

  return gsTimeline
}
