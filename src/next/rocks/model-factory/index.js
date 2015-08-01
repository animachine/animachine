import {Project} from './models'

function create(projectSource) {
  return new ProjectNode(projectSource)
}

export default {
  create
}
