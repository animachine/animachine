function track({eventName, value}) {
  if (isExtension()) {
    chrome.runtime.sendMessage({
        subject: 'track',
        eventName,
        value,
      },
      function(response) {
        console.log(response.farewell)
      }
    )
  }
}

function isExtension() {
  self.chrome && self.chrome.storage
}

BETON.define({
  id: 'tracker',
  dependencies: [],
  init: () => {
    return {
      track,
    }
  }
})
