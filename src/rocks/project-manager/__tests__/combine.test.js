import {assert} from 'chai'
import normalizeProjectTree from '../normalizeProjectTree'
import * as combine from '../selectors/combine'
import filter from  'lodash/collection/filter'
import projectTree from './testProjectTree'


describe('combine', () => {
  it('works', () => {
    const normalized = normalizeProjectTree(projectTree)
    const combined = combine.combineProject(normalized)

    assert.deepEqual(projectTree, combined)
  })
})
