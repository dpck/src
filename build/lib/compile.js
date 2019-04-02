const { c, b } = require('erte');
const { join } = require('path');
let makePromise = require('makepromise'); if (makePromise && makePromise.__esModule) makePromise = makePromise.default;
const { chmod } = require('fs');
const { exists } = require('@wrote/wrote');
let detect = require('static-analysis'); const { sort } = detect; if (detect && detect.__esModule) detect = detect.default;
let getExternsDir = require('@depack/externs'); const { dependencies: externsDeps } = getExternsDir; if (getExternsDir && getExternsDir.__esModule) getExternsDir = getExternsDir.default;
let frame = require('frame-of-mind'); if (frame && frame.__esModule) frame = frame.default;
const { removeStrict, getWrapper, hasJsonFiles, prepareOutput } = require('./');
const { prepareCoreModules, fixDependencies } = require('./closure');
const run = require('./run');

/**
 * Compile a Node.JS file into a single executable.
 * @param {CompileConfig} options Options for the Node.JS package compiler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {boolean} [options.noStrict=false] Removes `use strict` from the output. Default `false`.
 * @param {boolean} [options.verbose=false] Print all arguments to the compiler. Default `false`.
 * @param {RunConfig} runOptions General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [runOptions.compilerVersion] Used in the display message.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 */
const Compile = async (options, runOptions, compilerArgs = []) => {
  const { src, noStrict, verbose } = options
  const { output } = runOptions
  if (!src) throw new Error('Source is not given.')
  const args = [
    ...compilerArgs,
    '--package_json_entry_names', 'module,main',
  ]
  const detected = await detect(src)
  warnOfCommonJs(detected)

  const sorted = sort(detected)
  const {
    commonJs, commonJsPackageJsons, internals, js, packageJsons,
  } = sorted
  const internalDeps = await prepareCoreModules({ internals })
  const externs = await getExterns(internals)
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
  })
  const wrapper = getWrapper(internals, noStrict)

  const hasJson = hasJsonFiles(detected)
  if (hasJson) {
    console.log(c('You\'re importing a JSON file. Make sure to use require instead of import.', 'yellow'))
  }
  const Args = [
    ...args,
    ...externs,
    ...(files.length > 1 ? ['--module_resolution', 'NODE'] : []),
    ...(commonJs.length || hasJson ? ['--process_common_js_modules'] : []),
    ...(wrapper ? ['--output_wrapper', wrapper] : []),
    '--js', ...files,
  ]
  verbose ? console.error(Args.join(' ')) : printCommand(args, externs, sorted)

  const stdout = await run(Args, runOptions)
  if (!output) {
    const o = prepareOutput(stdout, wrapper, noStrict)
    console.log(o.trim())
  } else {
    await removeStrict(output, wrapper, noStrict)
    await makePromise(chmod, [output, '755'])
  }
}

const printCommand = (args, externs, sorted) => {
  const s = [...args, ...externs].join(' ')
    .replace(/--js_output_file (\S+)/g, (m, f) => {
      return `--js_output_file ${c(f, 'red')}`
    })
    .replace(/--externs (\S+)/g, (m, f) => {
      return `--externs ${c(f, 'grey')}`
    })
    .replace(/--compilation_level (\S+)/g, (m, f) => {
      return `--compilation_level ${c(f, 'green')}`
    })
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
 * @param {Array<import('static-analysis').Detection>} analysis
 */
const warnOfCommonJs = (analysis) => {
  const res = analysis.map(({ hasMain, name, from }) => {
    if (!(hasMain && name)) return
    const fromSrc = from.filter((s) => {
      const detection = analysis.find(({ entry: e }) => {
        return e === s
      })
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
${b('/* no named */', 'grey')} import myModule from 'my-module';
myModule.method('hello world')
https://github.com/google/closure-compiler/issues/3308`
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

/**
 * Returns options to include externs.
 */
const getExterns = async (internals) => {
  const externsDir = getExternsDir()
  const allInternals = internals
    .reduce((acc, i) => {
      const deps = externsDeps[i] || []
      return [...acc, i, ...deps]
    }, [])
    .filter((e, i, a) => a.indexOf(e) == i)
  const p = [...allInternals, 'global', 'nodejs']
    .map(i => {
      if (['module', 'process', 'console'].includes(i)) i = `_${i}`
      return join(externsDir, `${i}.js`)
    })
  await Promise.all(p.map(async pp => {
    const exist = await exists(pp)
    if (!exist) throw new Error(`Externs ${pp} don't exist.`)
  }))
  const args = p.reduce((acc, e) => {
    return [...acc, '--externs', e]
  }, [])
  return args
}

module.exports=Compile

/* documentary types/compile.xml */
/**
 * @typedef {Object} CompileConfig Options for the Node.JS package compiler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {boolean} [noStrict=false] Removes `use strict` from the output. Default `false`.
 * @prop {boolean} [verbose=false] Print all arguments to the compiler. Default `false`.
 */

/* documentary types/index.xml */
/**
 * @typedef {Object} RunConfig General options for running of the compiler.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
