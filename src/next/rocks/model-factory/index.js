import {Project} from './models'

function create(projectSource) {
  return new Project(projectSource)
}

export default {
  create
}
