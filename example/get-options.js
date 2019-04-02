import { getOptions } from '../src'

const opts = getOptions({
  advanced: true,
  iife: true,
  languageIn: 2019,
  languageOut: 2017,
  noWarnings: true,
  prettyPrint: true,
  output: 'bundle.js',
  argv: ['--externs', 'externs.js'],
})
console.log(opts)