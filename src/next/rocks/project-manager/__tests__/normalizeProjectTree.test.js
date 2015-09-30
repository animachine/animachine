import {assert} from 'chai'
import normalizeProjectTree from '../normalizeProjectTree'
import filter from  'lodash/collection/filter'
import projectTree from './testProjectTree'

describe('normalizeProjectTree', () => {
  it('is a function', () => {
    assert.isFunction(normalizeProjectTree)
  })
  describe('works because it', () => {
    const normalized = normalizeProjectTree(projectTree)

    it('returns an object', () => {
      assert.isObject(normalized)
    })

    it('makes items array', () => {
      assert.isArray(normalized.items)
    })

    function testItems(type, amount) {
      it(`makes ${type} items`, () => {
        const items = filter(normalized.items, {type})
        assert.lengthOf(items, amount)
      })
    }
    testItems('timeline', 1)
    testItems('track', 1)
    testItems('param', 2)
    testItems('key', 6)
    testItems('ease', 6)
    testItems('selector', 2)
    testItems('selectorCommand', 1)
    testItems('selectorCommandParam', 2)
  })
})
