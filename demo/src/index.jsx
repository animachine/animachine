require('./index.html') //for the webpack build
require('./styles.css')
require('file?name=[name]!./CNAME')

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, Redirect, browserHistory} from 'react-router'
import createHistory from 'history/lib/createHashHistory'
import App from './App'
import About from './About'
import Demo from './Demo'

const history = createHistory({
  queryKey: false
})


ReactDOM.render(<Router history={history}>
  <Route component={App}>
    {/*<Route path="about" component={About}/>*/}
    <Route path=":name" component={Demo}/>
    {/*<Redirect from='*' to='/demo/Box' />*/}
  </Route>
</Router>, document.querySelector('#react-mount'))
