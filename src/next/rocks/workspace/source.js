export default
{type: 'divider', direction: 'column', children: [
  {type: 'divider', size: 2, direction: 'row', children: [
    {type: 'block', size: 3, hole: true},
    {type: 'block', children: [
      {type: 'tab', id: 'debugger', label: 'debugger', hideableHead: true},
    ]}
  ]},
  {type: 'block', size: 1, children: [
    {type: 'tab', id: 'timeline', hideableHead: true}
  ]},
]}
