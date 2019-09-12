import { join, basename, sep } from 'path'

const getLanguage = (l) => {
  if (/^\d+$/.test(l)) return `ECMASCRIPT_${l}`
  return l
}

/**
 * Returns the arguments for the compiler.
 * @param {!_depack.GetOptions} [opts] Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @param {string} [opts.compiler] The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`.
 * @param {string} [opts.output] Sets the `--js_output_file` flag.
 * @param {string} [opts.level] Sets the `--compilation_level` flag.
 * @param {boolean} [opts.advanced=false] Sets the `--compilation_level` flag to `ADVANCED`. Default `false`.
 * @param {(string|number)} [opts.languageIn] Sets the `--language_in` flag. If a year is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @param {(string|number)} [opts.languageOut] Sets the `--language_out` flag. If a number is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.
 * @param {boolean} [opts.sourceMap=true] Adds the `--create_source_map %outname%.map` flag. Default `true`.
 * @param {boolean} [opts.prettyPrint=false] Adds the `--formatting PRETTY_PRINT` flag. Default `false`.
 * @param {boolean} [opts.iife=false] Adds the `--isolation_mode IIFE` flag. Default `false`.
 * @param {boolean} [opts.noWarnings=false] Sets the `--warning_level QUIET` flag. Default `false`.
 * @param {string} [opts.debug] The location of the file where to save sources after each pass. Disables source maps as these 2 options are incompatible.
 * @param {!Array<string>} [opts.argv] Any additional arguments to the compiler.
 */
const getOptions = (opts = {}) => {
  const {
    compiler = require.resolve('google-closure-compiler-java/compiler.jar'),
    output, level, advanced, languageIn, languageOut, sourceMap = true,
    argv = [], prettyPrint, noWarnings, debug, iife, chunkOutput,
  } = opts
  /** @type {!Array<string>} */
  const options = ['-jar', compiler]
  if (level) {
    options.push('--compilation_level', level)
  } else if (advanced) {
    options.push('--compilation_level', 'ADVANCED')
  }
  if (languageIn) {
    const lang = getLanguage(languageIn)
    options.push('--language_in', lang)
  }
  if (languageOut) {
    const lang = getLanguage(languageOut)
    options.push('--language_out', lang)
  }
  if ((output || chunkOutput) && sourceMap && !debug) {
    options.push('--create_source_map', '%outname%.map',
      // '--source_map_include_content'
    )
  }
  if (prettyPrint) {
    options.push('--formatting', 'PRETTY_PRINT')
  }
  if (debug) {
    options.push('--print_source_after_each_pass')
  }
  if (iife) {
    options.push('--isolation_mode', 'IIFE')
  }
  if (noWarnings || debug) {
    options.push('--warning_level', 'QUIET')
  }
  options.push(...argv)
  if (output) {
    options.push('--js_output_file', output)
  }
  if (chunkOutput) {
    options.push('--chunk_output_path_prefix', join(chunkOutput, sep))
  }
  return options
}

/**
 * Returns the location of the output file, even when the directory is given.
 * @param {string} output
 * @param {string} [src]
 */
export const getOutput = (output, src) => {
  let o = /\.js$/.test(output) ? output : join(output, basename(src))
  o = o.replace(/jsx$/, 'js')
  return o
}

export default getOptions

/* documentary types/options.xml */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {_depack.GetOptions} GetOptions Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {Object} _depack.GetOptions Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
 * @prop {string} [compiler] The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`.
 * @prop {string} [output] Sets the `--js_output_file` flag.
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
