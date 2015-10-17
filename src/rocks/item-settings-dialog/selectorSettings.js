import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'
import without from 'lodash/array/without'
import createTypeSelector from './createTypeSelector'


function getItemsByIds(ids) {
  const {selectors} = BETON.require('project-manager')
  return ids.map(id => selectors.getItemById({id}))
}

function actions() {
  return BETON.require('project-manager').actions
}

function addNewSelector(connect/*selectors[]*/) {
  actions().addSelectorToTrack({trackId: connect.parent.id})
}

function removeSelector(connect/*selector{}*/) {
  actions().removeSelectorFromTrack({
    trackId: connect.nthParent(1).id,
    childSelectorId: connect.value.id
  })
}

function addNewSelectorCommand(connect/*selector{}*/) {
  actions().addSelectorCommandToSelector({selectorId: connect.value.id})
}

function removeSelectorCommand(connect/*selectorCommand{}*/) {
  actions().removeSelectorCommandFromSelector({
    selectorId: connect.parent.id,
    childSelectorCommandId: connect.value.id
  })
}

function handleChangeSelectorCommandType(value, connect/*selectorCommand.type*/) {
  actions().setTypeOfSelectorCommand({
    selectorCommandId: connect.parent.id,
    type: value
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
    childSelectorCommandParamId: connect.value.id
  })
}

function handleChangeSelectorCommandParamKey(value, connect/*selectorCommandParam.key*/) {
  actions().setKeyOfSelectorCommandParam({
    selectorCommandParamId: connect.value.id,
    key: value
  })
}

function handleChangeSelectorCommandParamValue(value, connect/*selectorCommandParam.value*/) {
  actions().setValueOfSelectorCommandParam({
    selectorCommandParamId: connect.value.id,
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
    children: null,
    extraInputs: [
      {
        value: connect => connect.value.key,
        onChange: handleChangeSelectorCommandParamKey
      },
      {
        value: connect => connect.value.value,
        onChange: handleChangeSelectorCommandParamValue
      }
    ],
    buttons: [
      {icon: 'close', onClick: removeSelectorCommandParam}
    ]
  },
]
