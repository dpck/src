const { c } = require('erte');
const { join } = require('path');
let makePromise = require('makepromise'); if (makePromise && makePromise.__esModule) makePromise = makePromise.default;
const { chmod } = require('fs');
const { builtinModules } = require('module');
const { exists } = require('@wrote/wrote');
let detect = require('static-analysis'); const { sort } = detect; if (detect && detect.__esModule) detect = detect.default;
// import getExternsDir, { dependencies as externsDeps } from '@depack/externs'
let frame = require('frame-of-mind'); if (frame && frame.__esModule) frame = frame.default;
const { removeStrict, getWrapper, hasJsonFiles, prepareOutput, getShellCommand, replaceWithColor, detectExterns, createExternsArgs, checkExternsExist } = require('./');
const { prepareCoreModules, fixDependencies } = require('./closure');
const run = require('./run');

/** @type {function(): string} */
const getExternsDir = require(/*ok depack*/'@depack/externs')
const { 'dependencies': externsDeps } = getExternsDir

/**
 * Compile a Node.JS file into a single executable.
 * @param {!_depack.CompileConfig} options Options for the Node.JS package compiler.
 * @param {!_depack.RunConfig} [runOptions] General options for running of the compiler.
 * @param {!Array<string>} [compilerArgs] The compiler args got with `getOptions` and/or manually extended.
 */
const Compile = async (options, runOptions = {}, compilerArgs = []) => {
  const { src, noStrict, verbose, silent } = options
  const { output } = runOptions
  if (!src) throw new Error('Source is not given.')
  // allow to pass internals in --externs arg, e.g.,
  // --externs stream
  // this is when externs are needed but not imported in code
  /** @type {!Array<string>} */
  const foundAdditional = compilerArgs.reduce((acc, val, i, a) => {
    if (val != '--externs') return acc
    const next = a[i + 1]
    if (!next) return acc
    if (builtinModules.includes(next)) {
      compilerArgs[i] = ''
      compilerArgs[i + 1] = ''
      acc.push(next)
    }
    return acc
  }, [])
  const realCompilerArgs =
    foundAdditional.length ? compilerArgs.filter(a => a) : compilerArgs


  const args = [
    ...realCompilerArgs,
    '--package_json_entry_names', 'module,main',
    '--entry_point', src,
  ]
  const detected = await detect(src, {
    fields: ['externs'],
  })
  const { files: detectedExterns, nodeJS } = await detectExterns(detected)
  detectedExterns.length && console.error('%s %s', c('Modules\' externs:', 'blue'), detectedExterns.join(' '))
  const detectedExternsArgs = createExternsArgs(detectedExterns)
  warnOfCommonJs(detected)

  const sorted = sort(detected)
  const {
    commonJs, commonJsPackageJsons, internals, js, packageJsons,
  } = sorted
  const internalDeps = await prepareCoreModules({ internals })
  const externs = await getNodeExterns(internals, [
    ...foundAdditional,
    ...nodeJS,
  ])
  await fixDependencies(commonJsPackageJsons, packageJsons)

  const files = [src,
    ...commonJsPackageJsons,
    ...packageJsons,
    ...js,
    ...commonJs,
    ...internalDeps,
  ].sort((a, b) => {
    if (a.startsWith('node_modules')) return -1
    if (b.startsWith('node_modules')) return 1
    return 0
  })
  const wrapper = getWrapper(internals)
  const jsonFiles = hasJsonFiles(detected)

  const Args = [
    ...args,
    ...externs,
    ...detectedExternsArgs,
    ...(files.length > 1 ? ['--module_resolution', 'NODE'] : []),
    ...(commonJs.length ? ['--process_common_js_modules'] : []),
    ...(wrapper ? ['--output_wrapper', wrapper] : []),
    '--js', ...files,
  ]
  if (jsonFiles.length && !commonJs.length) {
    const hasRequired = jsonFiles.filter(({ required }) => {
      return required
    }, false)
    if (hasRequired.length) {
      console.error('You are requiring JSON files. Make sure their relative paths will stay the same to the build.')
      console.log(hasRequired.map(({ entry, from }) => {
        return `${c(entry, 'blue')} from ${from.join(' ')}`
      })
        .join('\n'))
    }
  }
  verbose ? console.error(getShellCommand(Args)) : printCommand(args, [
    ...externs, ...detectedExternsArgs,
  ], sorted)

  const stdout = await run(Args, runOptions)
  if (!output) {
    const o = prepareOutput(stdout, wrapper, noStrict).trim()
    if (!silent) console.log(o)
    return o
  }

  await removeStrict(output, wrapper, noStrict)
  await makePromise(chmod, [output, '755'])
  return stdout
}

const printCommand = (args, externs, sorted) => {
  let s = getShellCommand([...args, ...externs])
  s = replaceWithColor(s, 'js_output_file', 'red')
  s = replaceWithColor(s, 'externs', 'grey')
  s = replaceWithColor(s, 'compilation_level', 'green', true)
  console.error(s)
  const {
    commonJs, internals, js, deps,
  } = sorted
  const fjs = js.filter(filterNodeModule)
  const cjs = commonJs.filter(filterNodeModule)
  if (deps.length) console.error('%s: %s',
    c('Dependencies', 'yellow'), deps.filter((e, i, a) => {
      return a.indexOf(e) == i
    }).join(' '))
  if (fjs.length) console.error('%s: %s',
    c('Modules', 'yellow'), fjs.join(' '))
  if (cjs.length) console.error('%s: %s',
    c('CommonJS', 'yellow'), cjs.join(' '))
  if (internals.length) console.error('%s: %s',
    c('Built-ins', 'yellow'), internals.join(', '))
}

/**
 * @param {!Array<!_staticAnalysis.Detection>} analysis
 */
const warnOfCommonJs = (analysis) => {
  const res = analysis.map(({ hasMain, name, from }) => {
    if (!(hasMain && name)) return
    const fromSrc = from.filter((s) => {
      const detection = analysis.find(({ entry: e }) => {
        return e === s
      })
      if (!detection) return
      if (detection.hasMain) return
      return true
    })
    if (!fromSrc.length) return
    return { name, fromSrc }
  }).filter(Boolean)
  if (res.length) {
    console.error(c(getCompatWarning(), 'red'))
    console.error('The following commonJS packages referenced in ES6 modules don\'t support named exports:')
    res.forEach(({ name, fromSrc }) => {
      console.error(' %s from %s', c(name, 'red'), c(fromSrc.join(' '), 'grey'))
    })
  }

  return res
}

const getCompatWarning = () => {
  let s = `CommonJS don't have named exports, make sure to use them like
` + `import myModule from 'my-module' /* CommonJS Compat */
myModule.default.method('hello world') // yes Node.JS, wat r u doing
myModule.default('must explicitly call default')`
  const mx = s.split('\n').reduce((acc, { length }) => {
    if (length > acc) return length
    return acc
  }, 0)
  if (process.stderr.isTTY && mx + 4 < process.stderr.columns) {
    s = frame(s)
  }
  return s
}

const filterNodeModule = (entry) => {
  return !entry.startsWith('node_modules')
}

const unique = (e, i, a) => a.indexOf(e) == i

/**
 * Returns compiler arguments to include Node.JS externs.
 * @param {!Array<string>} internals The list of builtin Node.JS modules used.
 * @param {!Array<string>} additional Any extra Node.JS modules to be included
 */
const getNodeExterns = async (internals, additional = []) => {
  const externsDir = getExternsDir()
  const allInternals = [...internals, ...additional]
    .filter(unique)
    .reduce((acc, i) => {
      const deps = externsDeps[i] || []
      return [...acc, i, ...deps]
    }, [])
    .filter(unique)
  const internalExterns = [...allInternals, 'global', 'global/buffer', 'nodejs']
    .map(i => {
      if (['module', 'process', 'console', 'crypto'].includes(i)) i = `_${i}`
      return join(externsDir, `${i}.js`)
    })
  await checkExternsExist(internalExterns)
  const args = createExternsArgs(internalExterns)
  return args
}

module.exports=Compile

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('static-analysis').Detection} _staticAnalysis.Detection
 */

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').CompileConfig} _depack.CompileConfig
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('../../compile').RunConfig} _depack.RunConfig
 */

module.exports.getNodeExterns = getNodeExterns