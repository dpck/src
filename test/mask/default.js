import makeTestSuite from '@zoroaster/mask'
import TempContext from 'temp-context'
// import Context from '../context'
import { Bundle, Compile, getOptions } from '../../src'

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

export const compile = makeTestSuite('test/result/compile', {
  context: TempContext,
  /**
   * @param {TempContext} t
   */
  async getResults({ write }) {
    const options = getOptions({
      advanced: true,
      languageOut: 2019,
    })
    const src = await write('src.js', this.input)
    const res = await Compile({
      silent: true,
      src,
    }, {}, options)
    return res
  },
})