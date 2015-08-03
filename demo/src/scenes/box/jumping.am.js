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
              name: 'translate',
              params: [
                {
                  name: 'x',
                  keys: [
                    {time: 0, value: 100},
                    {time: 2000, value: 200},
                  ]
                }, {
                  name: 'y',
                  keys: [
                    {time: 0, value: 300},
                    {time: 2000, value: 300},
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
  var gsapSource = createAnimationSource(project, timeline.name)
  animations[timeline.name] = gsapSource
})

export default animations
