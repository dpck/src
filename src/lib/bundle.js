import { rm } from '@wrote/wrote'
import generateTemp from '@depack/bundle'
import { relative } from 'path'
import staticAnalysis, { sort } from 'static-analysis'
import { getCommand, updateSourceMaps, hasJsonFiles } from './'
import run from './run'

/**
 * Bundle the source code.
 * @param {BundleConfig} options Options for the web bundler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {string} [options.tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @param {boolean} [options.preact=false] Adds `import { h } from 'preact'` automatically. Default `false`.
 * @param {RunConfig} runOptions General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [runOptions.compilerVersion] Used in the display message.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {Array<string>} compilerArgs Extra arguments for the compiler.
 */
const Bundle = async (options, runOptions, compilerArgs = []) => {
  const { src, tempDir = 'depack-temp', preact } = options
  const { output, compilerVersion, debug, noSourceMap } = runOptions
  if (!src) throw new Error('Entry file is not given.')
  const analysis = await staticAnalysis(src, { nodeModules: false })
  const hasJsx = analysis.some(({ entry }) => {
    return entry.endsWith('.jsx')
  })
  let deps
  let processCommonJs
  if (hasJsx) {
    deps = await generateTemp(src, { tempDir, preact })
  } else {
    const detected = await staticAnalysis(src)
    const sorted = sort(detected)
    const {
      commonJs, commonJsPackageJsons, js, packageJsons,
    } = sorted
    const hasJson = hasJsonFiles(detected)
    processCommonJs = Boolean(commonJs.length || hasJson)
    deps = [src, ...commonJs, ...packageJsons,
      ...js,
      ...commonJsPackageJsons]
  }

  let sigint = false
  const getSigInt = () => {
    return sigint
  }
  // process.on('SIGINT', () => {
  //   sigint = true
  // })
  const PreArgs = [
    ...compilerArgs,
    ...(output && !noSourceMap ? ['--source_map_include_content'] : []),
    ...(deps.length > 1 ? ['--module_resolution', 'NODE'] : []),
    ...(processCommonJs ? ['--process_common_js_modules'] : []),
  ]
  const jjs = hasJsx ? deps.map((j) => {
    return j.startsWith(tempDir) ? relative(tempDir, j) : j
  }) : deps
  const a = getCommand(PreArgs, jjs)
  console.error(a)
  const Args = [...PreArgs, '--js', ...deps]

  await run(Args, { debug, compilerVersion, output,
    noSourceMap, getSigInt })
  if (hasJsx) {
    if (!sigint && output && !noSourceMap)
      await updateSourceMaps(output, tempDir)
    await rm(tempDir)
  }
}

export default Bundle

/* documentary types/bundle.xml */
/**
 * @typedef {Object} BundleConfig Options for the web bundler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {string} [tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @prop {boolean} [preact=false] Adds `import { h } from 'preact'` automatically. Default `false`.
 */

/* documentary types/index.xml */
/**
 * @typedef {Object} RunConfig General options for running of the compiler.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
