import loading from 'indicatrix'
import spawn from 'spawncommand'
import { c } from 'erte'
import { createWriteStream } from 'fs'
import { makeError } from './closure'
import { addSourceMap } from './'

/**
 * Spawns Java and executes the compilation.
 */
export default async (args, {
  debug, compilerVersion = '', output, noSourceMap, getSigInt = () => {},
}) => {
  let { promise, stderr: compilerStderr } = spawn('java', args)
  if (debug) compilerStderr.pipe(createWriteStream(debug))

  const { stdout, stderr, code } = await loading(`Running Google Closure Compiler${compilerVersion ? c(compilerVersion, 'grey') : ''}`, promise, {
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