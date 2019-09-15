import { rm } from '@wrote/wrote'
import generateTemp from '@depack/bundle'
import { join, relative } from 'path'
import staticAnalysis, { sort } from 'static-analysis'
import { getCommand, updateSourceMaps, hasJsonFiles, createExternsArgs, detectExterns, getBundleArgs } from './'
import run from './run'

/**
 * @param {string|!Array<string>} src The path or paths to the entries.
 * @param {boolean} [needsAnalysis] Whether the shallow analysis result needs to be returned.
 */
export const doesSrcHaveJsx = async (src, needsAnalysis) => {
  if (!needsAnalysis && Array.isArray(src)) {
    if (src.some(endsWithJsx)) return { hasJsx: true }
  } else if (!needsAnalysis && endsWithJsx(src)) return { hasJsx: true }

  const analysis = await staticAnalysis(src, { shallow: true })
  const hasJsx = analysis.some(({ entry, name }) => {
    if (name) return false // return node_modules
    return endsWithJsx(entry)
  })
  return { hasJsx, analysis }
}
const endsWithJsx = (name) => {
  return name.endsWith('.jsx')
}

/**
 * Create the temp dir.
 */
export const prepareTemp = async (src, { tempDir, preact, preactExtern, forceTemp }) => {
  let Src = src
  if (forceTemp) {
    await generateTemp(src, { tempDir, preact, preactExtern })
    Src = join(tempDir, src)
    return { Src, hasJsx: true }
  }
  const { hasJsx, analysis } = await doesSrcHaveJsx(src)
  if (hasJsx) {
    await generateTemp(src, { tempDir, preact, preactExtern })
    Src = join(tempDir, src)
  }
  return { Src, hasJsx, analysis }
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

export default Bundle

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').BundleConfig} _depack.BundleConfig
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').RunConfig} _depack.RunConfig
 */