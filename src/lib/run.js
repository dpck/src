import loading from 'indicatrix'
import spawn from 'spawncommand'
import { c } from 'erte'
import { createWriteStream } from 'fs'
import { makeError } from './closure'
import { addData } from './'

/**
 * Spawns Java and executes the compilation.
 * @param {!Array<string>} args The arguments to Java.
 * @param {!_depack.RunConfig} [opts] General options for running of the compiler.
 * @param {string} [opts.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [opts.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [opts.compilerVersion] Used in the display message.
 * @param {boolean} [opts.noSourceMap=false] Disables source maps. Default `false`.
 * @return {!Promise<string>} Stdout of JavaProcess
 */
const run = async (args, opts = {}) => {
  const {
    debug, compilerVersion, output, noSourceMap, outputFiles,
  } = opts
  let { promise, stderr: compilerStderr } = spawn('java', args)
  if (debug) compilerStderr.pipe(createWriteStream(debug))

  const { stdout, stderr, code } = await loading(`Running Google Closure Compiler${
    compilerVersion ? ' ' + c(compilerVersion, 'grey') : ''
  }`, promise, {
    writable: process.stderr,
  })
  // if(process.stderr.isTTY) process.stderr.write(' '.repeat(process.stderr.columns))

  if (code) throw new Error(makeError(code, stderr))
  if (outputFiles && !noSourceMap) {
    await Promise.all(outputFiles.map(async (outputFile) => {
      await addData(outputFile, { sourceMap: true })
    }))
  }
  else if (output) await addData(output, { sourceMap: !noSourceMap })
  if (stderr && !debug) console.warn(c(stderr, 'grey'))
  else if (debug) console.log('Sources after each pass saved to %s', debug)
  return stdout
}

export default run

/* typal types/index.xml */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {_depack.RunConfig} RunConfig General options for running of the compiler.
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {Object} _depack.RunConfig General options for running of the compiler.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
