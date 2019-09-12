const { _Compile, _Bundle, _getOptions } = require('./depack')

/**
 * Compiles a _Node.JS_ source file with dependencies into a single executable (with the `+x` addition). Performs regex-based static analysis of the whole of the dependency tree to construct the list of JS files. If any of the files use `require`, adds the `--process_common_js_modules` flag. Returns the `stdout` of the compiler, and prints to the console if output is not given in `runOptions`.
 * @param {!_depack.CompileConfig} options Options for the Node.JS package compiler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {boolean} [options.noStrict=false] Removes `use strict` from the output. Default `false`.
 * @param {boolean} [options.verbose=false] Print all arguments to the compiler. Default `false`.
 * @param {boolean} [options.silent=false] If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @param {boolean} [options.library=false] Whether to create a library. Default `false`.
 * @param {!_depack.RunConfig} [runOptions] General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a potential bug in _GCC_.
 * @param {string} [runOptions.compilerVersion] Used in the display message. Obtained with the `getCompilerVersion` method.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {!Array<string>=} [compilerArgs] The compiler args got with `getOptions` and/or manually extended. `getOptions` needs to be called first to find out the compiler's JAR at minimum.
 * @return {Promise<string>}
 */
function Compile(options, runOptions, compilerArgs) {
  return _Compile(options, runOptions, compilerArgs)
}

/**
 * Bundles the browser source code into a _JavaScript_ file. If there are any _JSX_ dependencies, the bundler will transpile them first using [ÀLaMode/JSX](https://github.com/a-la/jsx). Returns the `stdout` of the compiler, and prints to the console if output is not given in `runOptions`.
 * @param {!_depack.BundleConfig} options Options for the web bundler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {string} [options.tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @param {boolean} [options.preact=false] Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @param {boolean} [options.silent=false] If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @param {boolean} [options.preactExtern=false] Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope and won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the actual source code does not need manual editing. Default `false`.
 * @param {!_depack.RunConfig} [runOptions] General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a potential bug in _GCC_.
 * @param {string} [runOptions.compilerVersion] Used in the display message. Obtained with the `getCompilerVersion` method.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {!Array<string>=} [compilerArgs] The compiler args got with `getOptions` and/or manually extended.
 * @return {Promise<string>}
 */
function Bundle(options, runOptions, compilerArgs) {
  return _Bundle(options, runOptions, compilerArgs)
}

/**
 * Returns an array of options to pass to the compiler for `Compile`, `Bundle` and `BundleChunks` methods.
 * @param {!_depack.GetOptions} options Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @param {string} [options.compiler] The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`.
 * @param {string} [options.output] Sets the `--js_output_file` flag.
 * @param {string} [options.chunkOutput] Sets the `--chunk_output_path_prefix` flag.
 * @param {string} [options.level] Sets the `--compilation_level` flag.
 * @param {boolean} [options.advanced=false] Sets the `--compilation_level` flag to `ADVANCED`. Default `false`.
 * @param {(string|number)} [options.languageIn] Sets the `--language_in` flag. If a year is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @param {(string|number)} [options.languageOut] Sets the `--language_out` flag. If a number is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @param {boolean} [options.sourceMap=true] Adds the `--create_source_map %outname%.map` flag. Default `true`.
 * @param {boolean} [options.prettyPrint=false] Adds the `--formatting PRETTY_PRINT` flag. Default `false`.
 * @param {boolean} [options.iife=false] Adds the `--isolation_mode IIFE` flag. Default `false`.
 * @param {boolean} [options.noWarnings=false] Sets the `--warning_level QUIET` flag. Default `false`.
 * @param {string} [options.debug] The location of the file where to save sources after each pass. Disables source maps as these 2 options are incompatible.
 * @param {!Array<string>} [options.argv] Any additional arguments to the compiler.
 * @return {!Array<string>}
 */
function getOptions(options) {
  return _getOptions(options)
}

module.exports.Compile = Compile
module.exports.Bundle = Bundle
module.exports.getOptions = getOptions

/* typal types/index.xml namespace */
/**
 * @typedef {_depack.RunConfig} RunConfig General options for running of the compiler.
 * @typedef {Object} _depack.RunConfig General options for running of the compiler.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a potential bug in _GCC_.
 * @prop {string} [compilerVersion] Used in the display message. Obtained with the `getCompilerVersion` method.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */

/* typal types/options.xml namespace */
/**
 * @typedef {_depack.GetOptions} GetOptions `＠record` Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @typedef {Object} _depack.GetOptions `＠record` Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @prop {string} [compiler] The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`.
 * @prop {string} [output] Sets the `--js_output_file` flag.
 * @prop {string} [chunkOutput] Sets the `--chunk_output_path_prefix` flag.
 * @prop {string} [level] Sets the `--compilation_level` flag.
 * @prop {boolean} [advanced=false] Sets the `--compilation_level` flag to `ADVANCED`. Default `false`.
 * @prop {(string|number)} [languageIn] Sets the `--language_in` flag. If a year is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @prop {(string|number)} [languageOut] Sets the `--language_out` flag. If a number is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @prop {boolean} [sourceMap=true] Adds the `--create_source_map %outname%.map` flag. Default `true`.
 * @prop {boolean} [prettyPrint=false] Adds the `--formatting PRETTY_PRINT` flag. Default `false`.
 * @prop {boolean} [iife=false] Adds the `--isolation_mode IIFE` flag. Default `false`.
 * @prop {boolean} [noWarnings=false] Sets the `--warning_level QUIET` flag. Default `false`.
 * @prop {string} [debug] The location of the file where to save sources after each pass. Disables source maps as these 2 options are incompatible.
 * @prop {!Array<string>} [argv] Any additional arguments to the compiler.
 */

/* typal types/compile.xml namespace */
/**
 * @typedef {_depack.CompileConfig} CompileConfig Options for the Node.JS package compiler.
 * @typedef {Object} _depack.CompileConfig Options for the Node.JS package compiler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {boolean} [noStrict=false] Removes `use strict` from the output. Default `false`.
 * @prop {boolean} [verbose=false] Print all arguments to the compiler. Default `false`.
 * @prop {boolean} [silent=false] If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @prop {boolean} [library=false] Whether to create a library. Default `false`.
 */

/* typal types/bundle.xml namespace */
/**
 * @typedef {_depack.BundleConfig} BundleConfig Options for the web bundler.
 * @typedef {Object} _depack.BundleConfig Options for the web bundler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {string} [tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @prop {boolean} [preact=false] Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @prop {boolean} [silent=false] If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @prop {boolean} [preactExtern=false] Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope and won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the actual source code does not need manual editing. Default `false`.
 */
