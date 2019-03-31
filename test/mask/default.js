import makeTestSuite from '@zoroaster/mask'
import Context from '../context'
import src from '../../src'

// export default
makeTestSuite('test/result', {
  async getResults(input) {
    const res = await src({
      text: input,
    })
    return res
  },
  context: Context,
})