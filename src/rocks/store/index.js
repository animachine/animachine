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

      // if (__DEV__) {
      //   console.log(action.type, action)
      // }
    function reducerSwitch(state = {}, action) {
      tracker.track({eventType: action.type, value: action})

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

    store.subscribe(() => console.log('FIRE!!!!!', store.getState()))

    return store
  }
})
