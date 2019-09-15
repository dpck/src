/**
 * @fileoverview
 * @externs
 */

/* typal types/index.xml externs */
/** @const */
var _depack = {}
/**
 * General options for running of the compiler.
 * @typedef {{ output: (string|undefined), debug: (string|undefined), compilerVersion: (string|undefined), noSourceMap: (boolean|undefined) }}
 */
_depack.RunConfig

/* typal types/bundle.xml externs */
/**
 * Options for the web bundler.
 * @record
 */
_depack.BundleBase
/**
 * Where to save prepared JSX files. Default `depack-temp`.
 * @type {string|undefined}
 */
_depack.BundleBase.prototype.tempDir
/**
 * Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @type {boolean|undefined}
 */
_depack.BundleBase.prototype.preact
/**
 * If output is not given, don't print to `stdout`. By default, the output will be printed. Default `false`.
 * @type {boolean|undefined}
 */
_depack.BundleBase.prototype.silent
/**
 * Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope and won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the actual source code does not need manual editing. Default `false`.
 * @type {boolean|undefined}
 */
_depack.BundleBase.prototype.preactExtern
/**
 * Options for the Bundle method.
 * @extends {_depack.BundleBase}
 * @record
 */
_depack.BundleConfig
/**
 * The entry file to bundle. Only a single file is accepted. To compile multiple files at once, use chunks.
 * @type {string}
 */
_depack.BundleConfig.prototype.src
/**
 * Options for the BundleChunks method.
 * @extends {_depack.BundleBase}
 * @record
 */
_depack.ChunksConfig
/**
 * The entry files to bundle. Chunks will be created according to the strategy (only `common` strategy is supported at the moment, which places any dependency which is required in more than one file in a `common` chunk).
 * @type {!Array<string>}
 */
_depack.ChunksConfig.prototype.srcs
/**
 * A function to be executed to compare the an existing static analysis result with the new one, to see if any files/dependencies were updated. Should return `true` when caches match to skip processing and return void.
 * @type {(function(!Array<!_staticAnalysis.Detection>): !Promise<boolean|undefined>)|undefined}
 */
_depack.ChunksConfig.prototype.checkCache = function(analysis) {}

/* typal types/compile.xml externs */
/**
 * Options for the Node.JS package compiler.
 * @typedef {{ src: string, noStrict: (boolean|undefined), verbose: (boolean|undefined), silent: (boolean|undefined), library: (boolean|undefined) }}
 */
_depack.CompileConfig

/* typal types/options.xml externs */
/**
 * Parameters for `getOptions`.
 * @record
 */
_depack.GetOptions
/**
 * The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`.
 * @type {string|undefined}
 */
_depack.GetOptions.prototype.compiler
/**
 * Sets the `--js_output_file` flag.
 * @type {string|undefined}
 */
_depack.GetOptions.prototype.output
/**
 * Sets the `--chunk_output_path_prefix` flag.
 * @type {string|undefined}
 */
_depack.GetOptions.prototype.chunkOutput
/**
 * Sets the `--compilation_level` flag.
 * @type {string|undefined}
 */
_depack.GetOptions.prototype.level
/**
 * Sets the `--compilation_level` flag to `ADVANCED`. Default `false`.
 * @type {boolean|undefined}
 */
_depack.GetOptions.prototype.advanced
/**
 * Sets the `--language_in` flag. If a year is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @type {((string|number))|undefined}
 */
_depack.GetOptions.prototype.languageIn
/**
 * Sets the `--language_out` flag. If a number is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @type {((string|number))|undefined}
 */
_depack.GetOptions.prototype.languageOut
/**
 * Adds the `--create_source_map %outname%.map` flag. Default `true`.
 * @type {boolean|undefined}
 */
_depack.GetOptions.prototype.sourceMap
/**
 * Adds the `--formatting PRETTY_PRINT` flag. Default `false`.
 * @type {boolean|undefined}
 */
_depack.GetOptions.prototype.prettyPrint
/**
 * Adds the `--isolation_mode IIFE` flag. Default `false`.
 * @type {boolean|undefined}
 */
_depack.GetOptions.prototype.iife
/**
 * Sets the `--warning_level QUIET` flag. Default `false`.
 * @type {boolean|undefined}
 */
_depack.GetOptions.prototype.noWarnings
/**
 * The location of the file where to save sources after each pass. Disables source maps as these 2 options are incompatible.
 * @type {string|undefined}
 */
_depack.GetOptions.prototype.debug
/**
 * Any additional arguments to the compiler.
 * @type {(!Array<string>)|undefined}
 */
_depack.GetOptions.prototype.argv


/** @type {string} */
process.env.DEPACK_MAX_COLUMNS