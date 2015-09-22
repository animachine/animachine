export default {
  timelines: [
    {
      name: 'jump',
      length: 2000,
      tracks: [
        {
          name: 'box',
          selectors: [[{key: 'box', name: 'box'}], []],
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
