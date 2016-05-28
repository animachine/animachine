import React from 'react'
import {afflatus} from 'afflatus'
import {Button, Icon, Input, ClickAway, List, ListItem} from 'react-matterkit'
import OverlayPanel from './OverlayPanel'

@afflatus
export default class TimelineName extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  handleClickHead = () => {
    this.setState({open: !this.state.open})
  };

  handleClickAway = () => {
    if (this.state.open) {
      this.setState({open: false})
    }
  };

  renderToolbarItems() {
    const {state: toolbar} = BETON.require('toolbar')
    return (
      <List>
        {toolbar
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((toolbarItem, idx) => {
            if (toolbarItem.getElement) {
              // return toolbarItem.getElement()
            }
            else {
              return (
                <ListItem
                  key={idx}
                  {...toolbarItem}
                  onClick={() => {
                    if (toolbarItem.onClick) {
                      toolbarItem.onClick()
                    }
                    this.handleClickAway()
                  }}
                />
              )
              const props = {
                key: idx,
                ...toolbarItem,
                mod: {kind: 'stamp', ...toolbarItem.mod}
              }
              console.log('render item', props)
              return <Button {...props}/>
            }
        })}
      </List>
    )
  }

  render() {
    const {state} = BETON.require('project-manager')
    return (
      <ClickAway onClickAway={this.handleClickAway}>
        <div style={{position: 'relative', flex: 1}}>
          <Icon
            icon='circle'
            onClick = {this.handleClickHead}
            style = {{
              width: 21,
              cursor: 'pointer',
            }}
          />
          {this.state.open
            ? (
              <OverlayPanel>
                {this.renderToolbarItems()}
              </OverlayPanel>
            )
            : null
          }
        </div>
      </ClickAway>
    )
  }
}
