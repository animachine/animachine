import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

const getWhitelist = type => {
  switch (type) {
    case 'project':
      return ['name']
    case 'timeline':
      return ['name']
    case 'track':
      return ['name']
    case 'param':
      return ['name']

  }
}

export default [
  {
    selector: 'ROOT',
    label: connect => connect.value.type,
    whitelist: connect => getWhitelist(connect.value.type),
    children: connect => getProjects(connect),
  }
]
