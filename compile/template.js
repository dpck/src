const { _Compile } = require('./depack')

/**
 * @methodType {_depack.Compile}
 */
function Compile(options, runOptions, compilerArgs) {
  return _Compile(options, runOptions, compilerArgs)
}

module.exports.Compile = Compile

/* typal types/index.xml namespace */

/* typal types/options.xml namespace */

/* typal types/compile.xml namespace */

/* typal types/bundle.xml namespace */
