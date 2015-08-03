export default function createAnimationSource(projectSource, timelineName) {
  function animationSource(connect) {
    const gsTimeline = new TimelineMax({repeat: -1})

    var timeline
    for (let i = 0; i < projectSource.timelines.length; ++i) {
      if (projectSource.timelines[i].name === timelineName) {
        timeline = projectSource.timelines[i]
        break
      }
    }

    function addParams(params, targets) {
      params.forEach(param => {
        var headTime = 0

        if (param.keys) {
          param.keys.forEach(key => {
            var duration = key.time - headTime
// console.log(duration,
// {[param.name]: key.value},
// headTime)
            gsTimeline.to(
              targets,
              duration / 1000,
              {[param.name]: key.value},
              headTime
            )

            headTime = key.time
          })

        }
        if (param.params) {
          addParams(param.params, targets)
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

  animationSource._amProjectSource = projectSource
  animationSource._amTimelineName = timelineName

  return animationSource
}
