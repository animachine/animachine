import {Project} from './models'

export function create(projectSource) {
  return new Project(projectSource)
}
