import React from 'react'
import {RouteHandler} from 'react-router'
// import scenes from './scenes'
// import map from 'lodash/collection/map'
// import findIndex from 'lodash/array/findIndex'
// import startCase from 'lodash/string/startCase'

// import {AppBar, Styles, IconButton, DropDownMenu, MenuItem} from 'material-ui'
// var theme = new Styles.ThemeManager()
// theme.setTheme(theme.types.DARK)
//
// theme.setComponentThemes({
//   appBar: {
//     color: '#121212',
//     // textColor: '#88ce02',
//   }
// })

// var menuItems = [
//   { type: MenuItem.Types.SUBHEADER, text: 'Demos:' },
//   ...map(scenes, (source, name) => {
//     return { route: '/demo/' + name, text: startCase(name), name }
//   })
// ]

export default class App extends React.Component {
  // static childContextTypes = {
  //   muiTheme: React.PropTypes.object
  // }

  static contextTypes = {
    router: React.PropTypes.object
  }

  // getChildContext() {
  //   return {
  //     muiTheme: theme.getCurrentTheme()
  //   }
  // }

  // showNav = () => {
  //   this.refs.leftNav.toggle()
  // }

  // handleNavChange = (e, idx, payload) => {
  //   this.context.router.transitionTo(payload.route)
  // }
  //
  // handleClickGithub = () => {
  //   window.open('https://github.com/azazdeaz/react-gsap-enhancer')
  // }

  render () {
    return (
      <div style={{display: 'flex', height: '100%'}}>
        {this.props.children}
      </div>
    )
  }
}
