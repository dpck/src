const { _Compile, _Bundle, _getOptions } = require('./depack')

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

module.exports.Compile = Compile
module.exports.Bundle = Bundle
module.exports.getOptions = getOptions

/* typal types/index.xml namespace */

/* typal types/options.xml namespace */

/* typal types/compile.xml namespace */

/* typal types/bundle.xml namespace */
