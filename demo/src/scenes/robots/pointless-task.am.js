import {createAnimationSource} from 'react-animachine-enhancer'

const projectSource = {
  timelines: [
    {
      name: 'jump',
      length: 2000,
      tracks: [
        {
          name: 'box',
          selectors: [[{find: 'conveyorGroup'}]],
          params: [
            {
              name: 'translate',
              params: [
                {
                  name: 'x',
                  keys: [
                    {time: 0, value: 100},
                    {time: 80, value: 0},
                    {time: 160, value: 200},
                  ]
                }, {
                  name: 'y',
                  keys: [
                    {time: 0, value: 100},
                    {time: 80, value: 200},
                    {time: 160, value: 100},
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

projectSource.timelines.forEach(timeline => {
  var gsapSource = createAnimationSource({projectSource, timeline})
  animations[timeline.name] = gsapSource
})

export default animations
