import React from 'react'
import QuickInterface from 'quick-interface'
import {transaction} from 'afflatus'
import {Panel} from 'react-matterkit'
import {createNameSettings} from '../utils'


export default class TimelineSelector extends React.Component {
  render () {
    const {state} = BETON.require('project-manager')
    const {onRequestClose} = this.props

    function selectProjectAndTimeline(item) {
      const {state} = BETON.require('project-manager')
      const [project, timeline] = item.type === 'Project'
        ? [item, item.timelines[0]]
        : [item.parent('Project'), item]

      transaction(() => {
        state.currentProject = project
        project.currentTimeline = timeline
      })

      onRequestClose()
    }

    function addTimeline(project) {
      transaction(() => {
        const timeline = project.addTimeline({name: 'new-timeline'})
        debugger
        selectProjectAndTimeline(timeline)
      })

      onRequestClose()
    }

    function createTimelineSettings(timeline) {
      const {state} = BETON.require('project-manager')
      return {
        describeRow: () => ({
          onClick: () => selectProjectAndTimeline(timeline),
          items: [
            createNameSettings(timeline),
            {
              type: 'button',
              describe: () => ({
                icon: 'cancel',
                tooltip: 'delete this timeline',
                onClick: () => {}
              }),
            }
          ],
          highlighted: state.currentTimeline === timeline,
          contextMenu: {
            items: [
              {
                label: 'rename',
                onClick: () => {
                  timeline.isRenaming = true
                }
              }
            ]
          }
        })
      }
    }

    function createProjectSettings(project) {
      const {state} = BETON.require('project-manager')
      return {
        open: true,
        describeRow: () => ({
          onClick: () => selectProjectAndTimeline(project),
          items: [
            createNameSettings(project),
            {
              type: 'button',
              describe: () => ({
                icon: 'plus',
                tooltip: 'add a new timeline to this project',
                onClick: () => addTimeline(project)
              }),
            }
          ],
          highlighted: state.currentProject === project,
          contextMenu: {
            items: [
              {
                label: 'new timeline',
                icon: 'plus',
                onClick: () => addTimeline(project)
              }, {
                label: 'rename',
                onClick: () => {
                  project.isRenaming = true
                }
              }
            ]
          },
        }),
        describeChildren: () => project.timelines.map(timeline => (
          <QuickInterface
            key = {timeline.uid}
            describe = {() => createTimelineSettings(timeline)}/>
        ))
      }
    }

    const renderProjects = projects => {
      return projects
        .map(project => (
          <QuickInterface {...{
            key: project.uid,
            describe: () => createProjectSettings(project)
          }}/>
        ))
    }

    return (
      <Panel style={{
          position: 'absolute',
          zIndex: 200,
          boxShadow: '0px 0px 5px 0px rgba(107,182,196,0.75)',
        }}>
        <QuickInterface
          describe={() => ({
            hiddenHead: true,
            describeChildren: () => renderProjects(state.projects)
          })}/>
      </Panel>
    )
  }
}
