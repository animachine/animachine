import {createAnimationSource} from 'animachine-connect'

var projectSource = [
  {$id: 0, type: 'Project', name: 'pointless', timelines: [1], currentTimeline: 1},
  {$id: 1, type: 'Timeline', name: 'task', tracks: [2,10,18,26]},

  {$id: 2, type: 'Track', name: 'shoulder', selectors: [3], params: [4,5,6]},
  {$id: 3, type: 'Selector', selectorType: 'css', query: '.shoulder'},
  {$id: 4, type: 'Param', name: 'rotationZ', keys: [7]},
  {$id: 5, type: 'Param', name: 'transformOriginX', keys: [8]},
  {$id: 6, type: 'Param', name: 'transformOriginY', keys: [9]},
  {$id: 7, type: 'Key', time: 0, value: -70},
  {$id: 8, type: 'Key', time: 0, value: 0.15},
  {$id: 9, type: 'Key', time: 0, value: 0.5},

  {$id: 10, type: 'Track', name: 'arm', selectors: [11], params: [12,13,14]},
  {$id: 11, type: 'Selector', selectorType: 'css', query: '.armGroup'},
  {$id: 12, type: 'Param', name: 'rotationZ', keys: [15]},
  {$id: 13, type: 'Param', name: 'transformOriginX', keys: [16]},
  {$id: 14, type: 'Param', name: 'transformOriginY', keys: [17]},
  {$id: 15, type: 'Key', time: 0, value: 90},
  {$id: 16, type: 'Key', time: 0, value: 0.075},
  {$id: 17, type: 'Key', time: 0, value: 0.5},

  {$id: 18, type: 'Track', name: 'forearm', selectors: [19], params: [20,21,22]},
  {$id: 19, type: 'Selector', selectorType: 'css', query: '.forearmGroup'},
  {$id: 20, type: 'Param', name: 'rotationZ', keys: [23]},
  {$id: 21, type: 'Param', name: 'transformOriginX', keys: [24]},
  {$id: 22, type: 'Param', name: 'transformOriginY', keys: [25]},
  {$id: 23, type: 'Key', time: 0, value: 90},
  {$id: 24, type: 'Key', time: 0, value: 0.075},
  {$id: 25, type: 'Key', time: 0, value: 0.5},

  {$id: 26, type: 'Track', name: 'pincer', selectors: [27], params: [28,29,30,31,32]},
  {$id: 27, type: 'Selector', selectorType: 'css', query: '.pincerGroup'},
  {$id: 28, type: 'Param', name: 'x', keys: [33]},
  {$id: 29, type: 'Param', name: 'y', keys: [34]},
  {$id: 30, type: 'Param', name: 'rotationZ', keys: [35]},
  {$id: 31, type: 'Param', name: 'transformOriginX', keys: [36]},
  {$id: 32, type: 'Param', name: 'transformOriginY', keys: [37]},
  {$id: 33, type: 'Key', time: 0, value: 461},
  {$id: 34, type: 'Key', time: 0, value: 272},
  {$id: 35, type: 'Key', time: 0, value: -80},
  {$id: 36, type: 'Key', time: 0, value: 0.5},
  {$id: 37, type: 'Key', time: 0, value: 0.09},
]

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
