import {
  registerRoot,
  registerProject
} from './register'

export default function connectDOM(rootNode, projectBundle, timelineName) {
  if (rootNode && projectBundle && timelineName) {
    createAnimationSource(rootNode, projectBundle, timelineName)
  }

  if (rootNode && projectBundle) {
    registerProject(rootNode, projectBundle)
  }
  else if (rootNode) {
    registerRoot(rootNode)
  }
}
