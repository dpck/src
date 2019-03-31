const $_lib_compile = require('./lib/compile');
const $_lib_bundle = require('./lib/bundle');
const $_lib_run = require('./lib/run');
const $_lib_get_options = require('./lib/get-options');

/**
 * If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.
 */
const GOOGLE_CLOSURE_COMPILER = process.env['GOOGLE_CLOSURE_COMPILER']

/**
 * Either the contents of resolved `google-closure-compiler-java` package.json file, or `target` if `GOOGLE_CLOSURE_COMPILER` env variable was set.
 */
const compilerPackage = GOOGLE_CLOSURE_COMPILER ? 'target' : require.resolve('google-closure-compiler-java/package.json')



module.exports.Compile = $_lib_compile
module.exports.Bundle = $_lib_bundle
module.exports.run = $_lib_run
module.exports.getOptions = $_lib_get_options
module.exports.GOOGLE_CLOSURE_COMPILER = GOOGLE_CLOSURE_COMPILER
module.exports.compilerPackage = compilerPackage