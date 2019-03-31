let loading = require('indicatrix'); if (loading && loading.__esModule) loading = loading.default;
let spawn = require('spawncommand'); if (spawn && spawn.__esModule) spawn = spawn.default;
const { c } = require('erte');
const { createWriteStream } = require('fs');
const { makeError } = require('./closure');
const { addSourceMap } = require('./');

/**
 * Spawns Java and executes the compilation.
 */
module.exports=async (args, {
  debug, compilerVersion, output, noSourceMap, getSigInt = () => {},
}) => {
  let { promise, stderr: compilerStderr } = spawn('java', args)
  if (debug) compilerStderr.pipe(createWriteStream(debug))

  const { stdout, stderr, code } = await loading(`Running Google Closure Compiler ${c(compilerVersion, 'grey')}`, promise, {
    writable: process.stderr,
  })
  // if(process.stderr.isTTY) process.stderr.write(' '.repeat(process.stderr.columns))

  if(getSigInt()) return

  if (code) throw new Error(makeError(code, stderr))
  if (stdout) console.log(); console.log(stdout)
  if (output && !noSourceMap) await addSourceMap(output)
  if (stderr && !debug) console.warn(c(stderr, 'grey'))
  else if (debug) console.log('Sources after each pass log saved to %s', debug)
}