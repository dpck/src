const { read } = require('@wrote/wrote');

const $_lib_compile = require('./lib/compile');
const $_lib_bundle = require('./lib/bundle');
const $_lib_run = require('./lib/run');
const $_lib_get_options = require('./lib/get-options');

/**
 * If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.
 */
const GOOGLE_CLOSURE_COMPILER = process.env['GOOGLE_CLOSURE_COMPILER']


/**
 * If `GOOGLE_CLOSURE_COMPILER` was set using an environment variable, returns `target`, otherwise reads the version from the `google-closure-compiler-java` package.json file.
 */
const getCompilerVersion = async () => {
  /** @type {string} */
  let compilerVersion = 'target'
  const compilerPackage = GOOGLE_CLOSURE_COMPILER ? 'target' : require.resolve('google-closure-compiler-java/package.json')

  if (!GOOGLE_CLOSURE_COMPILER) {
    const compilerPackageJson = await read(compilerPackage)
    const { 'version': cv } = JSON.parse(compilerPackageJson)
    ;[compilerVersion] = cv.split('.')
  }
  return compilerVersion
}

module.exports.getCompilerVersion = getCompilerVersion
module.exports.Compile = $_lib_compile
module.exports.Bundle = $_lib_bundle
module.exports.run = $_lib_run
module.exports.getOptions = $_lib_get_options
module.exports.getOutput = $_lib_get_options.getOutput
module.exports.GOOGLE_CLOSURE_COMPILER = GOOGLE_CLOSURE_COMPILER