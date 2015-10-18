BETON.define({
  id: 'hack-open-first-possible-project',
  dependencies: ['store', 'component-inspector', 'project-manager'],
  init: ({store, componentInspector, projectManager}) => {
    const {
      getInspectedComponents,
      getProjectSourcesOfComponent,
      getMountedComponentsOfProjectSource
    } = componentInspector.selectors

    function test() {
      if (!projectManager.selectors.getCurrentProjectId()) {
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
