import {observable} from 'mobservable'

class DomPickerState {
  @observable pickedDOMNode = null
}

export default new DomPickerState()
