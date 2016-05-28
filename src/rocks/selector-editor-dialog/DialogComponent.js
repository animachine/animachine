import React from 'react'
import {DialogComp} from 'spaceman'
import {Scrollable, Button} from 'react-matterkit'
import QuickInterface from 'quick-interface'

class SelectorRow extends React.Component {
  render() {
    const {selector} = this.props

    return (
      <QuickInterface
        describe={() => ({
          describeRow: () => ({
            hideLeftToggle: true,
            items: [
              {
                type: 'input',
                describe: () => ({
                  type: 'string',
                  value: selector.query,
                  onChange: value => selector.setQuery(value)
                })
              },
              {
                type: 'button',
                describe: () => ({
                  icon: 'close',
                  onClick: () => selector.parent('Track').removeSelector(selector),
                  tooltip: 'remove this selector',
                })
              }
            ]
          })
        })}
      />
    )
  }
}

const HELP_TEXT = (
  <div style={{marginTop: 12}}>
    <div>Here, you can add CSS selectors to Tracks.</div>
    <div>Everything is the same like in
      <span style={{fontFamily: 'monospace'}}>document.querySelector()</span>
      except that you also can use
      <span style={{fontFamily: 'monospace'}}>:route</span>
      to refer the root elements.
    </div>
  </div>
)

export default class DialogComponent extends React.Component {
  render() {
    const {track, onClose} = this.props

    return <DialogComp
        title = {`Selectors of Track "${track.name}"`}
        buttons = {[{label: 'close', onClick: onClose}]}
        onClose = {onClose}>
      <div style = {{display: 'flex', width: 432}}>
        <Scrollable style={{height: 453, flex: 1}}>
          <div>
            <QuickInterface
              describe={() => ({
                hiddenHead: true,
                describeChildren: () => track.selectors.map(selector => (
                  <SelectorRow key={selector.uid} selector={selector}/>
                ))
              })}
            />
            <Button
              label='add new selector'
              onClick={() => track.addSelector()}
              style={{marginTop: 12}}
            />
            {HELP_TEXT}
          </div>
        </Scrollable>
      </div>
    </DialogComp>
  }
}
