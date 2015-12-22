BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['store', 'component-inspector', 'project-manager'],
  init: ({store, componentInspector, projectManager}) => {
    const {
      getInspectedComponents,
      getProjectSourcesOfComponent,
      getMountedComponentsOfProjectSource
    } = componentInspector.getters

    const dispose = autorun(() => {
      if (projectManager.state.currentProject) {
        dispose()
        return
      }

      componentInspector.state.inspectedReactComponents.forEach(component => {

      })
    })

    function test() {
      if (!projectManager.state.currentProject) {
        getInspectedComponents().forEach(component => {
          const projectSources = getProjectSourcesOfComponent({component})
          if (projectSources.length) {
            const projectSource = projectSources[0]
            const previewComponents =
              getMountedComponentsOfProjectSource({projectSource})
            projectManager.actions.openProject({
              projectSource,
              previewComponents
            })
          }
        })

        setTimeout(test, 312)
      }
    }

    return () => {test()}
  }
})
