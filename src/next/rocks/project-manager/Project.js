var modelFactory
BETON.getRock('model-factory', rock => modelFactory = rock)

export default class Project {
  constructor(projectSource, previewComponents) {
    this.projectSource = projectSource
    this.previewComponents = previewComponents
    this.model = modelFactory.create(projectSource)
    // this.model = BETON.getRock('model-factory').create(projectSource)
  }
}
