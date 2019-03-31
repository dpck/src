const { rm } = require('@wrote/wrote');
let generateTemp = require('@depack/bundle'); if (generateTemp && generateTemp.__esModule) generateTemp = generateTemp.default;
const { relative } = require('path');
const { getCommand, updateSourceMaps } = require('./');
const run = require('./run');

/**
 * Bundle the source code.
 */
const Bundle = async ({
  src, tempDir = 'depack-temp',
  output, preact, compilerVersion, debug, noSourceMap,
}, compilerArgs = []) => {
  if (!src) throw new Error('Entry file is not given.')

  const deps = await generateTemp(src, { tempDir, preact })
  let sigint = false
  const getSigInt = () => {
    return sigint
  }
  // process.on('SIGINT', () => {
  //   sigint = true
  // })
  const Args = [
    ...compilerArgs,
    '--source_map_include_content',
    '--module_resolution', 'NODE',
    ...deps.reduce((acc, d) => {
      return [...acc, '--js', d]
    }, [])]
  const a = getCommand(Args, js => js.startsWith(tempDir) ? relative(tempDir, js) : js)
  console.log(a)

  await run(Args, { debug, compilerVersion, output,
    noSourceMap, getSigInt })
  if (!sigint && output && !noSourceMap) await updateSourceMaps(output, tempDir)
  await rm(tempDir)
}

module.exports=Bundle

/* documentary types/bundle.xml */
/**
 * @typedef {Object} BundleOptions Options for the Bundle Command.
 * @prop {string} src The source file to compile.
 * @prop {string} dest The output file to write to.
 * @prop {string} [level="ADVANCED"] The level of the optimisation. Default `ADVANCED`.
 * @prop {string} [tempDir="depack-temp"] The path to the temporary directory. Default `depack-temp`.
 * @prop {*} [sourceMap=true] Whether to include source maps. Default `true`.
 * @prop {Array<string>} [externs] The externs to compile with.
 * @prop {string} [languageIn="ECMASCRIPT_2018"] The language in flag. Default `ECMASCRIPT_2018`.
 * @prop {*} [noWarnings=false] Do not print compiler's warnings. Default `false`.
 */
