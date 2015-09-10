BETON.define({
  id: 'hack-open',
  dependencies: ['store', 'component-inspector', 'project-manager'],
  init: ({store, componentInspector, projectManager}) => {
    const {
      getInspectedComponents,
      getProjectSources,
      getComponentsWithProjectSource
    } = componentInspector.selectors

    // store.subscribe(test)
    test()

    function test() {
      if (!projectManager.selectors.getCurrentProjectId()) {
        getInspectedComponents().forEach(component => {
          const projectSources = getProjectSources({component})
          if (projectSources.length) {
            const projectSource = projectSources[0]
            const previewComponents =
              getComponentsWithProjectSource({projectSource})
            projectManager.actions.openProject({projectSource, previewComponents})
          }
        })

        setTimeout(test, 312)
      }
    }
  }
})
