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
 * @param {string} [options.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [options.tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @param {boolean} [options.preact=false] Adds `import { h } from 'preact'` automatically. Default `false`.
 * @param {string} [options.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [options.compilerVersion] Used in the display message.
 * @param {boolean} [options.noSourceMap=false] Disables source maps. Default `false`.
 */
const Bundle = async (options, compilerArgs = []) => {
  const {
    src, tempDir = 'depack-temp',
    output, preact, compilerVersion, debug, noSourceMap,
  } = options
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
    '--module_resolution', 'NODE',
    ...(processCommonJs ? ['--process_common_js_modules'] : []),
  ]
  const jjs = hasJsx ? deps.map((j) => {
    return j.startsWith(tempDir) ? relative(tempDir, j) : j
  }) : deps
  const a = getCommand(PreArgs, jjs)
  console.log(a)
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
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @prop {boolean} [preact=false] Adds `import { h } from 'preact'` automatically. Default `false`.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
