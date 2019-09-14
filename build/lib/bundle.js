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
    if (src.some(endsWithJsx)) return true
  } else if (endsWithJsx(src)) return true

  const analysis = await staticAnalysis(src, { nodeModules: false })
  const hasJsx = analysis.some(({ entry }) => endsWithJsx(entry))
  return hasJsx
}
const endsWithJsx = (name) => {
  return name.endsWith('.jsx')
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
 * @param {_depack.RunConfig} [runOptions] General options for running of the compiler.
 * @param {!Array<string>} [compilerArgs] Extra arguments for the compiler, including the ones got with `getOptions`.
 */
const Bundle = async (options, runOptions = {}, compilerArgs = []) => {
  const { src, tempDir = 'depack-temp', preact, preactExtern, silent } = options
  const { output, compilerVersion, debug, noSourceMap } = runOptions
  if (!src) throw new Error('Entry file is not given.')

  let deps
  let processCommonJs
  let { Src, hasJsx } = await prepareTemp(src, { tempDir, preact, preactExtern })

  const detected = await staticAnalysis(Src, {
    fields: ['externs'],
  })

  const { files: detectedExterns } = await detectExterns(detected)
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
  if (!output && stdout && !silent) console.log(stdout)
  if (hasJsx) {
    if (!sigint && output && !noSourceMap)
      await updateSourceMaps(output, tempDir)
    await rm(tempDir)
  }
  return stdout
}

module.exports=Bundle

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').BundleConfig} _depack.BundleConfig
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').RunConfig} _depack.RunConfig
 */

module.exports.doesSrcHaveJsx = doesSrcHaveJsx
module.exports.prepareTemp = prepareTemp