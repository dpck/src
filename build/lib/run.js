let loading = require('indicatrix'); if (loading && loading.__esModule) loading = loading.default;
let spawn = require('spawncommand'); if (spawn && spawn.__esModule) spawn = spawn.default;
const { c } = require('erte');
const { createWriteStream } = require('fs');
const { makeError } = require('./closure');
const { addSourceMap } = require('./');

/**
 * Spawns Java and executes the compilation.
 * @param {Array<string>} args The arguments to Java.
 * @param {RunConfig} opts General options for running of the compiler.
 * @param {string} [opts.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [opts.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [opts.compilerVersion] Used in the display message.
 * @param {boolean} [opts.noSourceMap=false] Disables source maps. Default `false`.
 * @return {Promise<string>} Stdout of JavaProcess
 */
const run = async (args, opts) => {
  const {
    debug, compilerVersion = '', output, noSourceMap, getSigInt = () => {},
  } = opts
  let { promise, stderr: compilerStderr } = spawn('java', args)
  if (debug) compilerStderr.pipe(createWriteStream(debug))

  const { stdout, stderr, code } = await loading(`Running Google Closure Compiler${
    compilerVersion ? ' ' + c(compilerVersion, 'grey') : ''
  }`, promise, {
    writable: process.stderr,
  })
  // if(process.stderr.isTTY) process.stderr.write(' '.repeat(process.stderr.columns))

  if(getSigInt()) return

  if (code) throw new Error(makeError(code, stderr))
  if (output && !noSourceMap) await addSourceMap(output)
  if (stderr && !debug) console.warn(c(stderr, 'grey'))
  else if (debug) console.log('Sources after each pass log saved to %s', debug)
  return stdout
}

module.exports=run

/* documentary types/index.xml */
/**
 * @typedef {Object} RunConfig General options for running of the compiler.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
