import {createTheme} from 'react-matterkit'

const matterkitTheme = createTheme()
export default matterkitTheme

matterkitTheme.extendSource('colors', () => ({
  //https://github.com/mrmrs/colors
  aqua: '#7FDBFF',
  blue: '#0074D9',
  lime: '#01FF70',
  navy: '#001F3F',
  teal: '#39CCCC',
  olive: '#3D9970',
  green: '#2ECC40',
  red: '#FF4136',
  maroon: '#85144B',
  orange: '#FF851B',
  purple: '#B10DC9',
  yellow: '#FFDC00',
  fuchsia: '#F012BE',
  gray: '#aaa',
  white: '#fff',
  black: '#111',
  silver: '#ddd',

  selected: '#01FF70',
}))

// matterkitTheme.extendSource('config', () => ({
//   lineHeight: 16,
// }))
//
// matterkitTheme.extendSource('font', () => ({
//   fontSize: '11px',
// }))
