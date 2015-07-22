import createAnimationSource from 'create-animation-source'

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

const animations = {}

project.timelines.forEach(timeline => {
  var gsapSource = createAnimationSource.bind(null, timeline, project)
  gsapSource._animachineProject = project
  gsapSource._animachineTimelineName = timeline.name
  animations[timeline.name] = gsapSource
})

export default animations
