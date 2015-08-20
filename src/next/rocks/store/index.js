import {createStore} from 'redux'

BETON.define('store', [], () => {
  const reducers = new Map()
  const store = createStore(reducerSwitch)

  function reducerSwitch(state = {}, action) {
    console.log(action.type, action)
    const nextState = {...state}
    reducers.forEach((reducer, path) => {
      nextState[path] = reducer(nextState[path], action)
    })
    return nextState
  }

  store.addReducer = (path, reducer) => {
    reducers.set(path, reducer)
    store.dispatch({type: ''})
  }

  store.subscribe(() => console.log(store.getState()))

  return store
})
