import { equal, ok } from 'zoroaster/assert'
import Context from '../context'
import src from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof src, 'function')
  },
  async 'calls package without error'() {
    await src()
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    const res = await src({
      text: FIXTURE,
    })
    ok(res, FIXTURE)
  },
}

export default T