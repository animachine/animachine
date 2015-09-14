import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

const getItems = connect => connect.path[1]

const getProjects = connect => {
  const items = getItems(connect)
  return filter(items, {type: 'project'})
}

const getChildren = (connect, name) => {
  const items = getItems(connect)
  return connect.value[name].map(id => find(items, {id}))
}

const getLabel = connect => connect.value.name

export default [
  {
    selector: 'ROOT',
    label: 'Projects',
    children: connect => getProjects(connect)
  },
  {
    selector: createTypeSelector('project'),
    children: connect => getChildren(connect, 'timelines'),
    label: connect => getLabel(connect),
  },
  {
    selector: createTypeSelector('timeline'),
    children: connect => getChildren(connect, 'tracks'),
    label: connect => getLabel(connect),
  },
  {
    selector: createTypeSelector('track'),
    children: connect => getChildren(connect, 'props'),
    label: connect => getLabel(connect),
  },
  {
    selector: createTypeSelector('prop'),
    children: connect => getChildren(connect, 'props'),
    label: connect => getLabel(connect),
  }
]
