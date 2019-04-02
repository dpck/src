import { getOutput } from '../src'

const file = getOutput('test.js')
console.log('File: %s', file)
const dir = getOutput('output', 'index.js')
console.log('Dir: %s', dir)