import React from 'react'

export default class DialogComponent extends React.Component {
  componentDidMount() {
    this.dispose = BETON.store.subscribe(this.handleStoreChange)
  }

  componentWillUnmount() {
    this.dispose()
  }

  handleStoreChange = () => {

  }

  render() {

  }
}
