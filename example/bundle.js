import { getCompilerVersion, Bundle, getOptions } from '../src'

(async () => {
  const compilerVersion = await getCompilerVersion()
  const options = getOptions({
    advanced: true,
    prettyPrint: true,
  })
  await Bundle({
    src: 'example/bundle-src.js',
  }, { compilerVersion }, options)
})()