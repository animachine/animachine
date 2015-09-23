import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'
import without from 'lodash/array/without'
import createTypeSelector from './createTypeSelector'


function getItemsByIds(ids) {
  const {selectors} = BETON.getRock('project-manager')
  return ids.map(id => selectors.getItemById({id}))
}

function actions() {
  return BETON.getRock('project-manager').actions
}

function addNewSelector(connect/*selectors[]*/) {
  actions().addSelectorToTrack({trackId: connect.parent.id})
}

function removeSelector(connect/*selector{}*/) {
  actions().removeSelectorFromTrack({
    trackId: connect.nthParent(1).id,
    selector: connect.value
  })
}

function addNewSelectorCommand(connect/*selector{}*/) {
  actions().addSelectorCommandToSelector({selectorId: connect.value.id})
}

function removeSelectorCommand(connect/*selectorCommand{}*/) {
  actions().removeSelectorCommandFromSelector({
    selectorId: connect.parent.id,
    selectorCommand: connect.value
  })
}

function handleChangeSelectorCommandType(connect/*selectorCommand.type*/, value) {
  actions().setTypeOfSelectorCommand({
    selectorCommandId: connect.parenet.id,
    type: value
  })
}

function handleChangeSelectorCommandParamKey(connect/*selectorCommandParam.key*/, value) {
  actions().setKeyOfSelectorCommandParam({
    selectorCommandParamId: connect.parenet.id,
    key: value
  })
}

function addNewSelectorCommandParam(connect/*selectorCommand[]*/) {
  actions().addSelectorCommandParamToSelectorCommand({
    selectorCommandId: connect.value.id
  })
}

function removeSelectorCommandParam(connect/*selectorCommandParam{}*/) {
  actions().removeSelectorCommandParamFromSelectorCommand({
    selectorCommandId: connect.parent.id,
    selectorCommandParam: connect.value
  })
}

function handleChangeSelectorCommandParamValue(connect/*selectorCommandParam.value*/, value) {
  actions().setValueOfSelectorCommandParam({
    selectorCommandParamId: connect.parenet.id,
    value
  })
}

export default [
  {
    //selectors
    selector: connect => (
      connect.parent &&
      connect.parent.type === 'track' &&
      connect.key === 'selectors'
    ),
    buttons: [{icon: 'plus', onClick: addNewSelector}],
    children: connect => getItemsByIds(connect.value)
  },
  {
    //selector
    selector: createTypeSelector('selector'),
    label: connect => `${connect.key}# selector`,
    buttons: [
      {icon: 'plus', onClick: addNewSelectorCommand},
      {icon: 'close', onClick: removeSelector}
    ],
    children: connect => getItemsByIds(connect.value.selectorCommands)
  },
  {
    //selector command
    selector: createTypeSelector('selectorCommand'),
    inputs: [
      {
        type: 'dropdown',
        options: ['find', 'findAll', 'findInChildren', 'findAllInChildren'],
        value: connect => connect.commandType,
        onChange: handleChangeSelectorCommandType
      }
    ],
    buttons: [
      {icon: 'plus', onClick: addNewSelectorCommandParam},
      {icon: 'close', onClick: removeSelectorCommand}
    ],
    children: connect => getItemsByIds(connect.value.selectorCommandParams)
  },
  {
    //selector command param
    selector: createTypeSelector('selectorCommandParam'),
    label: null,
    inputs: [
      {
        value: connect => connect.key,
        onChange: handleChangeSelectorCommandParamKey
      },
      {
        value: connect => connect.value,
        onChange: handleChangeSelectorCommandParamValue
      }
    ],
    buttons: [
      {icon: 'close', onClick: removeSelectorCommandParam}
    ]
  },
]
