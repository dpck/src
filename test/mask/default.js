import makeTestSuite from '@zoroaster/mask'
import TempContext from 'temp-context'
// import Context from '../context'
import { Bundle, getOptions } from '../../src'

export const bundle = makeTestSuite('test/result/bundle', {
  context: TempContext,
  /**
   * @param {TempContext} t
   */
  async getResults({ write }) {
    const options = getOptions()
    const src = await write('src.js', this.input)
    const res = await Bundle({
      silent: true,
      src,
    }, {}, options)
    return res
  },
})