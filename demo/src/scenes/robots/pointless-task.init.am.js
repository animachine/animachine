import {createAnimationSource} from 'react-animachine-enhancer'

const projectSource = {
  timelines: [
    {
      name: 'jump',
      length: 2000,
      tracks: [
        {
          name: 'shoulder',
          selectors: [[{type: 'find', selector: {name: 'shoulder'}}]],
          params: [
            {name: 'rotationZ', keys: [{time: 0, value: -70}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0.15}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 0.5}]}
          ]
        }, {
          name: 'arm',
          selectors: [[{type: 'find', selector: {name: 'armGroup'}}]],
          params: [
            {name: 'rotationZ', keys: [{time: 0, value: 90}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0.075}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 0.5}]}
          ]
        }, {
          name: 'forearm',
          selectors: [[{type: 'find', selector: {name: 'forearmGroup'}}]],
          params: [
            {name: 'rotationZ', keys: [{time: 0, value:90}]},
            {name: 'transformOriginX', keys: [{time: 0, value: 0.5}]},
            {name: 'transformOriginY', keys: [{time: 0, value: 0.5}]}
          ]
        }, {
          name: 'pincer',
          selectors: [[{type: 'find', selector: {name: 'pincerGroup'}}]],
          params: [
            {name: 'x', keys: [{time: 0, value: 461}]},
            {name: 'y', keys: [{time: 0, value: 272}]},
            {name: 'rotationZ', keys: [{time: 0, value: -80}]},
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
