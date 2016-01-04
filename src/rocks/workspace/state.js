import {observable} from 'mobservable'

class State {
  @mobservable collapsed = false
  @mobservable launchButtonX = 0
  @mobservable launchButtonY = 0
}

export default new State()
