import {observable} from 'mobservable'

class State {
  @observable collapsed = false
  @observable launchButtonX = 0
  @observable launchButtonY = 0
}

export default new State()
