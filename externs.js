/* typal types/index.xml */
/** @const */
var _depack = {}
/**
 * General options for running of the compiler.
 * @typedef {{ output: (string|undefined), debug: (string|undefined), compilerVersion: (string|undefined), noSourceMap: (boolean|undefined) }}
 */
_depack.RunConfig

/* typal types/bundle.xml */
/**
 * Options for the web bundler.
 * @typedef {{ src: string, tempDir: (string|undefined), preact: (boolean|undefined) }}
 */
_depack.BundleConfig

/* typal types/compile.xml */
/**
 * Options for the Node.JS package compiler.
 * @typedef {{ src: string, noStrict: (boolean|undefined), verbose: (boolean|undefined), library: (boolean|undefined) }}
 */
_depack.CompileConfig

/* typal types/options.xml */
/**
 * Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @typedef {{ compiler: (string|undefined), output: (string|undefined), level: (string|undefined), advanced: (boolean|undefined), languageIn: ((string|number)|undefined), languageOut: ((string|number)|undefined), sourceMap: (boolean|undefined), prettyPrint: (boolean|undefined), iife: (boolean|undefined), noWarnings: (boolean|undefined), debug: (string|undefined), argv: (!Array<string>|undefined) }}
 */
_depack.GetOptions
