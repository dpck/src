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
    src: '../depack/t/get-args.js',
  }, { compilerVersion }, options)
})()