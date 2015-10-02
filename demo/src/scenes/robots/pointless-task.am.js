import {createAnimationSource} from 'react-animachine-enhancer'

const projectSource = {
  timelines: [
    {
      name: 'jump',
      length: 2000,
      tracks: [
        {
          name: 'box',
          selectors: [[{type: 'find', selector: {key: 'ball'}}]],
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
        }, {
          name: 'shoulder',
          selectors: [[{type: 'find', selector: {key: 'shoulderGroup'}}]],
          params: [
            // {name: 'rotationZ', keys: [{time: 0, value: -15}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 1}]}
          ]
        }, {
          name: 'arm',
          selectors: [[{type: 'find', selector: {key: 'armGroup'}}]],
          params: [
            {name: 'rotationZ', keys: [{time: 0, value: 0}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 1}]}
          ]
        }, {
          name: 'forearm',
          selectors: [[{type: 'find', selector: {key: 'forearmGroup'}}]],
          params: [
            {name: 'rotationZ', keys: [{time: 0, value: 0}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0.5}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 0.09}]}
          ]
        }, {
          name: 'pincer',
          selectors: [[{type: 'find', selector: {key: 'pincerGroup'}}]],
          params: [
            {name: 'x', keys: [{time: 0, value: 461}]},
            {name: 'y', keys: [{time: 0, value: 272}]},
            {name: 'rotationZ', keys: [{time: 0, value: 0}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0.5}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 0.09}]}
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
