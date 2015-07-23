export default function createAnimationSource(project, timelineName) {
  function animationSource(connect) {
    const gsTimeline = new TimelineMax({repeat: -1})

    var timeline
    for (let i = 0; i < project.timelines.length; ++i) {
      if (project.timelines[i].name === timelineName) {
        timeline = project.timelines[i]
        break
      }
    }

    function addParams(params, targets) {
      var headTime = 0
      params.forEach(param => {
        if (param.keys) {

          param.keys.forEach(key => {
            var duration = key.time - headTime
            gsTimeline.to(
              targets,
              duration,
              {[param.name]: key.value},
              headTime
            )

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

  animationSource._animachineProject = project
  animationSource._animachineTimelineName = timelineName

  return animationSource
}
