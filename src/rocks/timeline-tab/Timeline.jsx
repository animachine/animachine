import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import Controls from './controls/Controls'
import Keylines from './Keylines'
import Timebar from './timebar/Timebar'
import Toolbar from './Toolbar'
import DividerLine from './DividerLine'
import customDrag from 'custom-drag'
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys'
import hotkeyMap from './hotkeyMap'
import {Scrollable, getTheme} from 'react-matterkit'
import InlineEaseEditor from './inline-ease-editor/InlineEaseEditor'

const projectManager = BETON.require('project-manager')

const dragOptions = {
  onDown(props, monitor, component) {
    monitor.setData({
      initDividerPos: component.state.dividerPos
    })
  },
  onDrag(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset().x
    const {initDividerPos} = monitor.data
    component.setState({dividerPos: initDividerPos + offset})
  }
}

@connect(
  (state) => {
    const projectManager = BETON.require('project-manager')
    const {getCurrentTimelineId, getItemById, getItems} = projectManager.selectors
    const timelineId = getCurrentTimelineId()
    if (!timelineId) {
      return {}
    }
    const timeline = getItemById({id: timelineId})
    const items = getItems()//pass items to make sure that timeline updates if any of the items has changed
    return {timeline, items}
  },
  () => {
    const projectManager = BETON.require('project-manager')
    return {
      actions: projectManager.actions,
      selectors: projectManager.selectors,
    }
  }
)
@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
export default class Timeline extends React.Component {
  static propTypes = {
    timeline: PropTypes.object,
    headHeight: PropTypes.number,
  }

  static defaultProps = {
    headHeight: 21
  }

  constructor(props) {
    super(props)
    this.state = {
      dividerPos: 300,
      fullWidth: 2000,
      scrollPosition: 0
    }
  }

  componentDidMount() {
    this.testOwnSize()
    this._testOwnSizeSetI = setInterval(this.testOwnSize, 321)
  }

  componentWillUnmount() {
    clearInterval(this._testOwnSizeSetI)
  }

  testOwnSize = () => {
    const {width: nodeWidth} = ReactDOM.findDOMNode(this).getBoundingClientRect()
    const {dividerPos, fullWidth} = this.state
    const {timeline} = this.props
    const {setWidthOfTimeline} = this.props.actions

    if (nodeWidth !== fullWidth) {
      this.setState({fullWidth: nodeWidth})
    }

    const timelineWidth = nodeWidth - dividerPos
    if (timeline && timeline.width !== timelineWidth) {
      setWidthOfTimeline({
        timelineId: timeline.id,
        width: timelineWidth
      })
    }
  }

  handleChangeScrollPosition = (scroll) => {
    this.setState({scrollPosition: scroll})
  }

  render() {
    const {dividerPos, fullWidth, scrollPosition} = this.state
    const {timeline, __combinedTimeline__, actions, selectors, headHeight, dragRef} = this.props
    const colors = getTheme(this).getStyle('colors')
    const rootStyle = {
      backgroundColor: colors.grey4,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }

    if (!timeline) {
      return <div hidden/>
    }

    const hotkeyHandlers = {
      delete() {
        actions.removeSelectedKeysOfTimeline({timelineId: timeline.id})
      }
    }
    const commonProps = {timeline, actions, selectors}

    return <HotKeys
        keyMap = {hotkeyMap}
        handlers = {hotkeyHandlers}
        style={{display: 'flex', pointerEvents: 'auto'}}>
      <div style={rootStyle}>
        <div style={{display: 'flex', height: headHeight}}>
          <Toolbar {...commonProps} style={{width: dividerPos}}/>
          <Timebar {...commonProps} height={headHeight}/>
        </div>
        <Scrollable
          style = {{display: 'flex', flex: 1, alignItems: 'flex-start'}}
          onChangeVerticalScroll = {this.handleChangeScrollPosition}
          verticalScroll = {scrollPosition}>
          <div style={{width: dividerPos}}>
            <Controls {...commonProps}/>
          </div>
          <Keylines {...commonProps}/>
        </Scrollable>
        <DividerLine ref={dragRef} position={dividerPos}/>
        <InlineEaseEditor {...{
            timeline,
            actions,
            selectors,
            dividerPos,
            scrollPosition,
          }}/>
      </div>
    </HotKeys>
  }
}
