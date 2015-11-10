import {createStore, applyMiddleware} from 'redux'
import frameDebounce from 'frame-debounce'
import {batchedSubscribe} from 'redux-batched-subscribe'

BETON.define({
  id: 'store',
  dependencies: ['tracker'],
  init: ({tracker}) => {
    const reducers = new Map()
    const batchDebounce = frameDebounce(notify => notify())
    const store = batchedSubscribe(batchDebounce)(createStore)(reducerSwitch)
    // const store = createStore(reducerSwitch)

    function reducerSwitch(state = {}, action) {
      if (__DEV__) {
        console.log(action.type, action)
      }
      tracker.track({eventType: action.type, value: action})
console.time('reducing time')
      const nextState = {...state}
      reducers.forEach((reducer, path) => {
// console.time('reducing time '+path)
        nextState[path] = reducer(nextState[path], action)
// console.timeEnd('reducing time '+path)
      })
console.timeEnd('reducing time')
      return nextState
    }

    store.addReducer = (path, reducer) => {
      reducers.set(path, reducer)
      store.dispatch({type: ''})
    }

    if (__DEV__) {
      store.subscribe(() => console.log(store.getState()))
    }

    return store
  }
})
