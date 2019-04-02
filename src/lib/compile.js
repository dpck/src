import { c } from 'erte'
import { join } from 'path'
import makePromise from 'makepromise'
import { chmod } from 'fs'
import { exists } from '@wrote/wrote'
import detect, { sort } from 'static-analysis'
import getExternsDir, { dependencies as externsDeps } from '@depack/externs'
import { removeStrict, getWrapper, hasJsonFiles } from './'
import { prepareCoreModules, fixDependencies } from './closure'
import run from './run'

/**
 * Compile a Node.JS file into a single executable.
 * @param {CompileConfig} options Options for the Node.JS package compiler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {string} [options.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {boolean} [options.noStrict=false] Removes `use strict` from the output. Default `false`.
 * @param {boolean} [options.verbose=false] Print all arguments to the compiler. Default `false`.
 * @param {string} [options.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [options.compilerVersion] Used in the display message.
 * @param {boolean} [options.noSourceMap=false] Disables source maps. Default `false`.
 */
const Compile = async (options, compilerArgs = []) => {
  const { src, output, noStrict, verbose,
    compilerVersion, noSourceMap, debug,
  } = options
  if (!src) throw new Error('Source is not given.')
  const args = [
    ...compilerArgs,
    '--module_resolution', 'NODE',
    '--package_json_entry_names', 'module,main',
  ]
  const detected = await detect(src)
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
  const wrapper = getWrapper(internals)

  const hasJson = hasJsonFiles(detected)
  if (hasJson) {
    console.log(c('You\'re importing a JSON file. Make sure to use require instead of import.', 'yellow'))
  }
  const Args = [
    ...args,
    ...externs,
    ...(commonJs.length || hasJson ? ['--process_common_js_modules'] : []),
    ...(wrapper ? ['--output_wrapper', wrapper] : []),
    '--js', ...files,
  ]
  verbose ? console.error(Args.join(' ')) : printCommand(args, externs, sorted)

  await run(Args, { debug, compilerVersion, output, noSourceMap })
  if (noStrict) await removeStrict(output)
  if (output) await makePromise(chmod, [output, '755'])
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
  if (deps.length) console.log('%s: %s',
    c('Dependencies', 'yellow'), deps.filter((e, i, a) => {
      return a.indexOf(e) == i
    }).join(' '))
  if (fjs.length) console.log('%s: %s',
    c('Modules', 'yellow'), fjs.join(' '))
  if (cjs.length) console.log('%s: %s',
    c('CommonJS', 'yellow'), cjs.join(' '))
  if (internals.length) console.log('%s: %s',
    c('Built-ins', 'yellow'), internals.join(', '))
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

export default Compile

/* documentary types/compile.xml */
/**
 * @typedef {Object} CompileConfig Options for the Node.JS package compiler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {string} [output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @prop {boolean} [noStrict=false] Removes `use strict` from the output. Default `false`.
 * @prop {boolean} [verbose=false] Print all arguments to the compiler. Default `false`.
 * @prop {string} [debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @prop {string} [compilerVersion] Used in the display message.
 * @prop {boolean} [noSourceMap=false] Disables source maps. Default `false`.
 */
