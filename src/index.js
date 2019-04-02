import { read } from '@wrote/wrote'

export { default as Compile } from './lib/compile'
export { default as Bundle } from './lib/bundle'
export { default as run } from './lib/run'
export { default as getOptions, getOutput } from './lib/get-options'

/**
 * If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.
 */
const GOOGLE_CLOSURE_COMPILER = process.env['GOOGLE_CLOSURE_COMPILER']

export { GOOGLE_CLOSURE_COMPILER }

/**
 * If `GOOGLE_CLOSURE_COMPILER` was set using an environment variable, returns `target`, otherwise reads the version from the `google-closure-compiler-java` package.json file.
 */
export const getCompilerVersion = async () => {
  let compilerVersion = 'target'
  const compilerPackage = GOOGLE_CLOSURE_COMPILER ? 'target' : require.resolve('google-closure-compiler-java/package.json')

  if (!GOOGLE_CLOSURE_COMPILER) {
    const compilerPackageJson = await read(compilerPackage)
    const { 'version': cv } = JSON.parse(compilerPackageJson)
    ;[compilerVersion] = cv.split('.')
  }
  return compilerVersion
}