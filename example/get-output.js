import { getOutput } from '../src'

const file = getOutput('output/example.js', 'src/example.js')
console.log('File: %s', file)
const dir = getOutput('output', 'src/index.js')
console.log('Dir: %s', dir)