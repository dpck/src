import makeTestSuite from '@zoroaster/mask'
import TempContext from 'temp-context'
import { join } from 'path'
import { fixDependencies } from '../../src/lib/closure'

const TS = makeTestSuite('test/result/closure/fix-dependencies', {
  context: TempContext,
  /**
   * @param {string} input
   * @param {TempContext} temp
   */
  async getResults(input, { add, snapshot }) {
    const p = await add(input)
    await fixDependencies(
      [join(p, 'main.json')], [join(p, 'module.json')]
    )
    return await snapshot()
  },
})

export default TS