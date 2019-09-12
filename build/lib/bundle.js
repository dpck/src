const { rm } = require('@wrote/wrote');
let generateTemp = require('@depack/bundle'); if (generateTemp && generateTemp.__esModule) generateTemp = generateTemp.default;
const { join, relative } = require('path');
let staticAnalysis = require('static-analysis'); const { sort } = staticAnalysis; if (staticAnalysis && staticAnalysis.__esModule) staticAnalysis = staticAnalysis.default;
const { getCommand, updateSourceMaps, hasJsonFiles, createExternsArgs, detectExterns, getBundleArgs } = require('./');
const run = require('./run');

/**
 * @param {string|!Array<string>} src
 */
const doesSrcHaveJsx = async (src) => {
  if (Array.isArray(src)) {
    return src.reduce(async (acc, current) => {
      const r = await acc
      if (r) return r
      return await _doesSrcHaveJsx(current)
    }, false)
  }
  return await _doesSrcHaveJsx(src)
}

const _doesSrcHaveJsx = async (src) => {
  const analysis = await staticAnalysis(src, { nodeModules: false })
  const hasJsx = src.endsWith('.jsx') || analysis.some(({ entry }) => {
    return entry.endsWith('.jsx')
  })
  return hasJsx
}

/**
 * Create the temp dir.
 */
const prepareTemp = async (src, { tempDir, preact, preactExtern, forceTemp }) => {
  let Src = src
  if (forceTemp) {
    await generateTemp(src, { tempDir, preact, preactExtern })
    Src = join(tempDir, src)
    return { Src, hasJsx: true }
  }
  const hasJsx = await doesSrcHaveJsx(src)
  if (hasJsx) {
    await generateTemp(src, { tempDir, preact, preactExtern })
    Src = join(tempDir, src)
  }
  return { Src, hasJsx }
}

/**
 * Bundle the source code.
 * @param {_depack.BundleConfig} options Options for the web bundler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {string} [options.tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @param {boolean} [options.preact=false] Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @param {boolean} [options.preactExtern=false] Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the source code stays the same. Default `false`.
 * @param {_depack.RunConfig} runOptions General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [runOptions.compilerVersion] Used in the display message.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {!Array<string>} compilerArgs Extra arguments for the compiler, including the ones got with `getOptions`.
 */
const Bundle = async (options, runOptions, compilerArgs = []) => {
  const { src, tempDir = 'depack-temp', preact, preactExtern } = options
  const { output, compilerVersion, debug, noSourceMap } = runOptions
  if (!src) throw new Error('Entry file is not given.')

  let deps
  let processCommonJs
  let { Src, hasJsx } = await prepareTemp(src, { tempDir, preact, preactExtern })

  const detected = await staticAnalysis(Src, {
    fields: ['externs'],
  })

  const { detectedExterns } = detectExterns(detected)
  const externs = createExternsArgs(detectedExterns)

  const sorted = sort(detected)
  const {
    commonJs, commonJsPackageJsons, js, packageJsons,
  } = sorted
  const jsonFiles = hasJsonFiles(detected)
  processCommonJs = Boolean(commonJs.length || jsonFiles.length)
  deps = [Src, ...commonJs, ...packageJsons,
    ...js,
    ...commonJsPackageJsons]

  let sigint = false
  const getSigInt = () => {
    return sigint
  }
  // process.on('SIGINT', () => {
  //   sigint = true
  // })
  const PreArgs = getBundleArgs(compilerArgs, externs, output, noSourceMap, deps, processCommonJs)

  const jjs = hasJsx ? deps.map((j) => {
    return j.startsWith(tempDir) ? relative(tempDir, j) : j
  }) : deps
  const a = getCommand(PreArgs, jjs)
  console.error(a)
  const Args = [...PreArgs, '--js', ...deps]

  const stdout = await run(Args, { debug, compilerVersion, output,
    noSourceMap, getSigInt })
  if (!output && stdout) console.log(stdout)
  if (hasJsx) {
    if (!sigint && output && !noSourceMap)
      await updateSourceMaps(output, tempDir)
    await rm(tempDir)
  }
}

module.exports=Bundle

/* typal types/bundle.xml */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {_depack.BundleConfig} BundleConfig Options for the web bundler.
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {Object} _depack.BundleConfig Options for the web bundler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {string} [tempDir="depack-temp"] Where to save prepared JSX files. Default `depack-temp`.
 * @prop {boolean} [preact=false] Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_. Default `false`.
 * @prop {boolean} [preactExtern=false] Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the source code stays the same. Default `false`.
 */

/* documentary types/index.xml */
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


module.exports.doesSrcHaveJsx = doesSrcHaveJsx
module.exports.prepareTemp = prepareTemp