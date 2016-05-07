import {deserialise} from 'afflatus'

// import {Key, Param, Track, Timeline, Project} from '../models'
import {historySave} from './history'
import state from '../state'

export function set(target: object, name: string, value: any) {
  const oldValue = target[name]

  historySave(
    () => target[name] = value,
    () => target[name] = oldValue
  )
}


//
// export function remove(parent: object, containerName: string, item: object) {
//   historySave(
//     () => {
//       parent[containerName].remove(item)
//       item.parent = null
//     },
//     () => {
//       parent[containerName].push(item)
//       item.parent = parent
//     }
//   )
// }
//
// export function createItem(type: string) {
//   switch (type) {
//     case 'ease': return new Ease()
//     case 'key': return new Key()
//     case 'param': return new Param()
//     case 'selector': return new Selector()
//     case 'track': return new Track()
//     case 'timeline': return new Timeline()
//     case 'project': return new Project()
//     default: throw `can't find item with the name "${type}"!`
//   }
// }
