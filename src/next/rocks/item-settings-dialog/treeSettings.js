import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'
import capitalize from 'lodash/string/capitalize'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

const getItems = () => BETON.getRock('project-manager').selectors.getItems()
const isTheLastSelected = connect => {
  const {selectors} = BETON.getRock('project-manager')
  const {lastSelectedItemId} = selectors.getProjectManager()
  return lastSelectedItemId === (connect.value && connect.value.id)
}

const getProjects = connect => {
  const items = getItems(connect)
  return filter(items, {type: 'project'})
}

const getChildren = (connect, name) => {
  const items = getItems(connect)
  return connect.value[name].map(id => find(items, {id}))
}

const getLabel = connect => `${connect.value.type}: ${connect.value.name}`

function handleSelectClick(connect) {
  const {actions} = BETON.getRock('project-manager')
  actions.setLastSelectedItemId({itemId: connect.value.id})
}

const createSettings = (type, childrenName) => ({
    selector: createTypeSelector(type),
    children: connect => getChildren(connect, childrenName),
    label: connect => getLabel(connect),
    highlighted: connect => isTheLastSelected(connect),
    onClick: connect => handleSelectClick(connect),
    buttons: connect => {
      const childrenType = childrenName.slice(0, -1)
      return [
        {
          icon: 'plus',
          tooltip: 'add new ${childrenType}',
          onClick: connect => {
            const {actions} = BETON.getRock('project-manager')
            actions[`add${capitalize(childrenType)}To${capitalize(type)}`]({
              [`${type}Id`]: connect.value.id
            })
          }
        }
      ]
    }
})

export default [
  {
    selector: 'root',
    label: 'Projects',
    children: connect => getProjects(connect)
  },
  createSettings('project', 'timelines'),
  createSettings('timeline', 'tracks'),
  createSettings('track', 'params'),
  createSettings('param', 'params'),
]
