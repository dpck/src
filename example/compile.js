import { getCompilerVersion, Compile, getOptions } from '../src'

(async () => {
  const compilerVersion = await getCompilerVersion()
  const options = getOptions({
    advanced: true,
    prettyPrint: true,
    languageIn: 2018,
    languageOut: 2017,
  })
  await Compile({
    src: 'example/compile-src.js',
  }, { compilerVersion }, options)
})()