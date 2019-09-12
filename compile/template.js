const {
  _run, _Compile, _Bundle, _getOptions, _getOutput, _getCompilerVersion,
  _GOOGLE_CLOSURE_COMPILER,
} = require('./depack')

/**
 * @methodType {_depack.run}
 */
function run(args, opts) {
  return _run(args, opts)
}

/**
 * @methodType {_depack.getCompilerVersion}
 */
function getCompilerVersion() {
  return _getCompilerVersion()
}

/**
 * @methodType {_depack.Compile}
 */
function Compile(options, runOptions, compilerArgs) {
  return _Compile(options, runOptions, compilerArgs)
}

/**
 * @methodType {_depack.Bundle}
 */
function Bundle(options, runOptions, compilerArgs) {
  return _Bundle(options, runOptions, compilerArgs)
}

/**
 * @methodType {_depack.getOptions}
 */
function getOptions(options) {
  return _getOptions(options)
}

/**
 * @methodType {_depack.getOutput}
 */
function getOutput(output, src) {
  return _getOutput(output, src)
}

/**
 * If the `GOOGLE_CLOSURE_COMPILER` jar path was set using the environment variable, it will be returned in this named exported.
 * @type {string}
 */
const GOOGLE_CLOSURE_COMPILER = _GOOGLE_CLOSURE_COMPILER

module.exports.run = run
module.exports.Compile = Compile
module.exports.Bundle = Bundle
module.exports.getOptions = getOptions
module.exports.getOutput = getOutput
module.exports.getCompilerVersion = getCompilerVersion
module.exports.GOOGLE_CLOSURE_COMPILER = GOOGLE_CLOSURE_COMPILER

/* typal types/index.xml namespace */

/* typal types/options.xml namespace */

/* typal types/compile.xml namespace */

/* typal types/bundle.xml namespace */
