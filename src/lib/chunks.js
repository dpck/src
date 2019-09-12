import { join, basename } from 'path'
import { rm } from '@wrote/wrote'
import { getBundleArgs, updateTempDirArgs, getCommand, unique, createExternsArgs, hasJsonFiles, detectExterns } from './'
import run from './run'
import staticAnalysis, { sort } from 'static-analysis'
import { prepareTemp, doesSrcHaveJsx } from './bundle'

export default async function BundleChunks(options, runOptions, compilerArgs = []) {
  const { srcs, tempDir = 'depack-temp', preact, preactExtern } = options
  const { output, compilerVersion, debug, noSourceMap } = runOptions
  if (!srcs) throw new Error('Entry files are not given.')
  if (!Array.isArray(srcs)) throw new Error('Expecting chunks.')

  let deps = []
  let processCommonJs = false
  let hasJsx = await doesSrcHaveJsx(srcs) // todo: share cache
  // If one has jsx, create temp for all.
  // @depack/bundle needs updating to reference src JS files and create
  // temp only for JSX.
  let detectedExterns = []
  // const chunks = []

  const chunksMap = {}
  // a map where source name is key and its dependencies are value
  const map = await srcs.reduce(async (acc, src) => {
    acc = await acc
    const { Src } = await prepareTemp(src, { tempDir, preact, preactExtern, forceTemp: hasJsx })

    const detected = await staticAnalysis(Src, {
      fields: ['externs'],
    })

    const { detectedExterns: de } = detectExterns(detected)
    detectedExterns = [...detectedExterns, ...de]

    const sorted = sort(detected)
    const {
      commonJs, commonJsPackageJsons, js, packageJsons,
    } = sorted

    const jsonFiles = hasJsonFiles(detected)
    processCommonJs = processCommonJs || Boolean(commonJs.length || jsonFiles.length)

    const sd = [...commonJs, ...packageJsons, ...js, ...commonJsPackageJsons]
    deps = [...deps, ...sd]

    acc[Src] = sd
    return acc
  }, {})

  const depsMap = deps.reduce((acc, current) => {
    if (!acc[current]) acc[current] = 1
    else acc[current]++
    return acc
  }, {})
  const commonChunk = Object.entries(depsMap).reduce((acc, [key, value]) => {
    if (value > 1) {
      acc.push('--js', key)
      // commonChunk['common'] = join(output, 'common.js')
    }
    return acc
  }, [])
  if (commonChunk.length) commonChunk.push('--chunk', 'common:auto')

  const outputFiles = []
  const chunks = Object.entries(map).reduce((acc, [key, value]) => {
    const chunkDeps = value.filter(v => depsMap[v] == 1)
    const c = chunkDeps.reduce(addJsArg, [])
    const name = basename(key).replace(/.jsx$/, '.js')
    const cu = [name.replace('.js', ''), chunkDeps.length + 1]
    if (chunkDeps.length != value.length) {
      chunksMap[name] = ['common']
      cu.push('common')
    }
    acc.push(...c, '--js', key, '--chunk', cu.join(':'))
    const file = join(output, name)
    outputFiles.push(file)
    return acc
  }, [])

  const externs = createExternsArgs(detectedExterns.filter(unique))

  const PreArgs = getBundleArgs(compilerArgs, externs, output, noSourceMap, deps, processCommonJs)
  // const jjs = hasJsx ?
  const depsAndChunks = [...commonChunk, ...chunks]
  const a = getCommand(PreArgs, updateTempDirArgs(depsAndChunks, tempDir))
  console.error(a)
  const Args = [...PreArgs, ...depsAndChunks]

  const stdout = await run(Args, { debug, compilerVersion, output,
    noSourceMap, outputFiles })
  if (!output && stdout) console.log(stdout)

  if (hasJsx) {
    // if (output && !noSourceMap)
    //   await updateSourceMaps(output, tempDir)
    await rm(tempDir)
  }
  return chunksMap
}

export const addJsArg = (a, v) => [...a, '--js', v]
