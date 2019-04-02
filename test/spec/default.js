import { makeError } from '../../src/lib/closure'
import { prepareOutput } from '../../src/lib'

const error = `node_modules/argufy/src/index.js:2: WARNING - Bad type annotation.
* @param {string[]} argv
^

node_modules/argufy/src/index.js:2: WARNING - Bad type annotation.
* @param {string[]} argv
^

t/argufy.js:3: ERROR - variable src$$module$t$argufy is undeclared
`
/** @type {Object.<string>} */
const TS = {
  async 'parses the warnings'() {
    return makeError(1, error)
  },
  async 'parses error with original'() {
    return makeError(1, `node_modules/preact/dist/preact.mjs:678:
Originally at:
node_modules/preact/src/vdom/component.js:287: WARNING - dangerous use of the global this object
                component.nextBase = base;
                ^^^^

t/argufy.js:3: ERROR - variable src$$module$t$argufy is undeclared`)
  },
}

export default TS

export const PrepareOutput = {
  'prepares output without strict'() {
    const wr = `#!/usr/bin/env node
'use strict';
const os = require('vm');`
    const wrapper = `${wr}%output%`
    const res = prepareOutput(`${wr}const {Script:aa} = vm;`, wrapper)
    return res
  },
  'prepares output with strict'() {
    const wr = `#!/usr/bin/env node
'use strict';
const os = require('vm');`
    const wrapper = `${wr}%output%`
    const res = prepareOutput(`${wr}'use strict';
const {Script:aa} = vm;`, wrapper)
    return res
  },
  'prepares output with strict but with noStrict'() {
    const wr = `#!/usr/bin/env node
'use strict';
const os = require('vm');`
    const wrapper = `${wr}%output%`
    const res = prepareOutput(`${wr}'use strict';
const {Script:aa} = vm;`, wrapper, true)
    return res
  },
}