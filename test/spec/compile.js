import { getExterns } from '../../src/lib/compile'

export default {
  'gets externs'() {
    return getExterns(['stream'], ['os', 'stream'])
  },
}