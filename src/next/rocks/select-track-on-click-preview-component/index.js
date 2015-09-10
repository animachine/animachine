BETON.define({
  id: 'select-track-on-click-preview-component',
  dependencies: ['workspace', 'project-manager', 'toolbar', 'cursor-type'],
  init: ({projectManager, toolbar}) => {
    function handlePick() {

    }

    workspace.setOverlay('contact-layer', {
      level: 1000,
      getElement: () => <ContactLayer/>
    })
  }
})
