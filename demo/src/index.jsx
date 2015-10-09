require('./index.html') //for the webpack build
require('./styles.css')

// import injectTapEventPlugin from 'react-tap-event-plugin'
// injectTapEventPlugin()

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, Redirect} from 'react-router'
import App from './App'
import About from './About'
import Demo from './Demo'


ReactDOM.render(<Router>
  <Route component={App}>
    {/*<Route path="about" component={About}/>*/}
    <Route path="demo/:name" component={Demo}/>
    {/*<Redirect from='*' to='/demo/Box' />*/}
  </Route>
</Router>, document.querySelector('#react-mount'))
