import {createStore} from 'redux'

BETON.define('store', [], () => {
  const reducers = new Map()

  function reducerSwitch(state = {}, action) {
    reducers.forEach(reducer, path) {
      reducer(state[path], action)
    }
  }

  return {
    store,
    setReducer(path, reducer) {
      reducers.set(path, reducer)
    }
  }
})
