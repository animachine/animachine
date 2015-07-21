const project = {
  timelines: [
    {
      name: 'jump',
      tracks: [
        {
          name: 'box',
          selectors: [['box']],
          params: [
            {
              name: 'scale',
              childParams: [
                {
                  name: 'scaleX',
                  keys: [
                    {time: 0, value: 0},
                    {time: 2, value: 1},
                  ]
                }, {
                  name: 'scaleY',
                  keys: [
                    {time: 0, value: 0},
                    {time: 2, value: 2},
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

function createGSAPSource(timeline, connect) {
  var gsTimeline = new TimelineMax()

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

const animations = {}

project.timelines.forEach(timeline => {
  var gsapSource = createGSAPSource.bind(null, timeline)
  gsapSource._animachineProject = project
  gsapSource._animachineTimelineName = timeline.name
  animations[timeline.name] = gsapSource
})

export default animations
