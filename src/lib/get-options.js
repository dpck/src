import { join, basename, sep } from 'path'

const getLanguage = (l) => {
  if (/^\d+$/.test(l)) return `ECMASCRIPT_${l}`
  return l
}

/**
 * Returns the arguments for the compiler.
 * @param {!_depack.GetOptions} [opts] Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options
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
 * @param {string} src
 */
export const getOutput = (output, src) => {
  let o = /\.js$/.test(output) ? output : join(output, basename(src))
  o = o.replace(/jsx$/, 'js')
  return o
}

export default getOptions


/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').GetOptions} _depack.GetOptions
 */