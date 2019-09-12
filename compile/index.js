const {
  _run, _Compile, _Bundle, _getOptions, _getOutput, _getCompilerVersion,
  _GOOGLE_CLOSURE_COMPILER, _BundleChunks,
} = require('./depack')

/**
 * Low-level API used by `Compile` and `Bundle`. Spawns _Java_ and executes the compilation. To debug a possible bug in the _GCC_, the sources after each pass can be saved to the file specified with the `debug` command. Also, _GCC_ does not add `// # sourceMappingURL=output.map` comment, therefore it's done by this method. Returns `stdout` of the _Java_ process. Returns the _stdout_ of the Java process.
 * @param {!Array<string>} args The arguments to Java.
 * @param {!_depack.RunConfig} [opts] General options for running of the compiler.
 * @param {string} [opts.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [opts.debug] The name of the file where to save sources after each pass. Useful when there's a potential bug in _GCC_.
 * @param {string} [opts.compilerVersion] Used in the display message. Obtained with the `getCompilerVersion` method.
 * @param {boolean} [opts.noSourceMap=false] Disables source maps. Default `false`.
 * @return {Promise<string>}
 */
function run(args, opts) {
  return _run(args, opts)
}

/**
 * If `GOOGLE_CLOSURE_COMPILER` was set using an environment variable, returns `target`, otherwise reads the version from the `google-closure-compiler-java` package.json file.
 * @return {Promise<string>}
 */
function getCompilerVersion() {
  return _getCompilerVersion()
}

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
 * @param {!_depack.BundleConfig} options Options for the Bundle method.
 * @param {string} options.src The entry file to bundle. Only a single file is accepted. To compile multiple files at once, use chunks.
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
 * Bundles the browser source code into multiple _JavaScript_ file. Works in the same way as `Bundle`, generating a temp dir for JSX dependencies.
 * @param {!_depack.ChunksConfig} options Options for the BundleChunks method.
 * @param {!Array<string>} options.srcs The entry files to bundle. Chunks will be created according to the strategy (only `common` strategy is supported at the moment, which places any dependency which is required in more than one file in a `common` chunk).
 * @param {!_depack.RunConfig} [runOptions] General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a potential bug in _GCC_.
 * @param {string} [runOptions.compilerVersion] Used in the display message. Obtained with the `getCompilerVersion` method.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {!Array<string>=} [compilerArgs] The compiler args got with `getOptions` and/or manually extended.
 * @return {Promise<string>}
 */
function BundleChunks(options, runOptions, compilerArgs) {
  return _BundleChunks(options, runOptions, compilerArgs)
}

/**
 * Returns an array of options to pass to the compiler for `Compile`, `Bundle` and `BundleChunks` methods. [Full list of supported arguments](https://github.com/google/closure-compiler/wiki/Flags-and-Options).
 * @param {!_depack.GetOptions} options Parameters for `getOptions`.
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

/**
 * Returns the location of the output file, even when the directory is given.
 * @param {string} output The path to the output dir or file.
 * @param {string} src The path to the source file. Will be used when the output is a dir.
 * @return {string}
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
module.exports.BundleChunks = BundleChunks
module.exports.getOptions = getOptions
module.exports.getOutput = getOutput
module.exports.getCompilerVersion = getCompilerVersion
module.exports.GOOGLE_CLOSURE_COMPILER = GOOGLE_CLOSURE_COMPILER

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
 * @typedef {_depack.GetOptions} GetOptions `＠record` Parameters for `getOptions`.
 * @typedef {Object} _depack.GetOptions `＠record` Parameters for `getOptions`.
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
 * @typedef {_depack.BundleBase} BundleBase `＠record` Options for the web bundler.
 * @typedef {Object} _depack.BundleBase `＠record` Options for the web bundler.
 * @prop {string} [tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @prop {boolean} [preact=false] Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @prop {boolean} [silent=false] If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @prop {boolean} [preactExtern=false] Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope and won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the actual source code does not need manual editing. Default `false`.
 * @typedef {_depack.BundleConfig} BundleConfig `＠record` Options for the Bundle method.
 * @typedef {_depack.BundleBase & _depack.$BundleConfig} _depack.BundleConfig `＠record` Options for the Bundle method.
 * @typedef {Object} _depack.$BundleConfig `＠record` Options for the Bundle method.
 * @prop {string} src The entry file to bundle. Only a single file is accepted. To compile multiple files at once, use chunks.
 * @typedef {_depack.ChunksConfig} ChunksConfig `＠record` Options for the BundleChunks method.
 * @typedef {_depack.BundleBase & _depack.$ChunksConfig} _depack.ChunksConfig `＠record` Options for the BundleChunks method.
 * @typedef {Object} _depack.$ChunksConfig `＠record` Options for the BundleChunks method.
 * @prop {!Array<string>} srcs The entry files to bundle. Chunks will be created according to the strategy (only `common` strategy is supported at the moment, which places any dependency which is required in more than one file in a `common` chunk).
 */
