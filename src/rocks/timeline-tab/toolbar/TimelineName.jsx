import React from 'react'
import {afflatus} from 'afflatus'
import {Button, Input, ClickAway} from 'react-matterkit'
import TimelineSelector from './TimelineSelector'

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

  render() {
    const {state} = BETON.require('project-manager')
    return (
      <ClickAway onClickAway={this.handleClickAway}>
        <div style={{position: 'relative', flex: 1}}>
          <Button
            mod = {{kind: 'stamp'}}
            label = {`${state.currentProject.name}/${state.currentTimeline.name}`}
            onClick = {this.handleClickHead}
            style = {{
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            />
          {this.state.open
            ? <TimelineSelector onRequestClose={this.handleClickAway}/>
            : null
          }
        </div>
      </ClickAway>
    )
  }
}
