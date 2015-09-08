function importTest(name, path) {
  describe(name, function () {
    require(path)
  })
}

describe('react-gsap-enhancer', function () {
  importTest('target', './project-manager/test.js')
})
