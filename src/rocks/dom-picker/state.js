import {defineModel, createModel} from 'afflatus'

defineModel({
  type: 'DomPickerState',
  simpleValues: {
    pickedDOMNode: {}
  }
})

export default createModel('DomPickerState')
