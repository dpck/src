export { default as Compile } from './lib/compile'
export { default as Bundle } from './lib/bundle'
export { default as run } from './lib/run'
export { default as getOptions } from './lib/get-options'

/**
 * If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.
 */
const GOOGLE_CLOSURE_COMPILER = process.env['GOOGLE_CLOSURE_COMPILER']

/**
 * Either the contents of resolved `google-closure-compiler-java` package.json file, or `target` if `GOOGLE_CLOSURE_COMPILER` env variable was set.
 */
const compilerPackage = GOOGLE_CLOSURE_COMPILER ? 'target' : require.resolve('google-closure-compiler-java/package.json')

export { GOOGLE_CLOSURE_COMPILER, compilerPackage }