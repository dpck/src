import { getNodeExterns } from '../../src/lib/compile'

export default {
  'gets externs'() {
    return getNodeExterns(['stream'], ['os', 'stream'])
  },
}