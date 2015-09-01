BETON.define('select-track-on-click-preview-component',
  ['workspace', 'project-manager', 'toolbar', 'cursor-type'],
  (projectManager, toolbar) => {

    function handlePick() {

    }

    workspace.setOverlay('contact-layer', {
      level: 1000,
      getElement: () => <ContactLayer/>
    })
  }
)
