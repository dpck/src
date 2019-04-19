import { c } from 'erte'
import { join, dirname } from 'path'
import makePromise from 'makepromise'
import { chmod } from 'fs'
import { exists } from '@wrote/wrote'
import detect, { sort } from 'static-analysis'
import getExternsDir, { dependencies as externsDeps } from '@depack/externs'
import frame from 'frame-of-mind'
import { removeStrict, getWrapper, hasJsonFiles, prepareOutput } from './'
import { prepareCoreModules, fixDependencies } from './closure'
import run from './run'

/**
 * Compile a Node.JS file into a single executable.
 * @param {_depack.CompileConfig} options Options for the Node.JS package compiler.
 * @param {string} options.src The entry file to bundle. Currently only single files are supported.
 * @param {boolean} [options.noStrict=false] Removes `use strict` from the output. Default `false`.
 * @param {boolean} [options.verbose=false] Print all arguments to the compiler. Default `false`.
 * @param {boolean} [options.library=false] Whether to create a library. Default `false`.
 * @param {_depack.RunConfig} runOptions General options for running of the compiler.
 * @param {string} [runOptions.output] The path where the output will be saved. Prints to `stdout` if not passed.
 * @param {string} [runOptions.debug] The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
 * @param {string} [runOptions.compilerVersion] Used in the display message.
 * @param {boolean} [runOptions.noSourceMap=false] Disables source maps. Default `false`.
 * @param {!Array<string>} compilerArgs The compiler args got with `getOptions` and/or manually extended.
 */
const Compile = async (options, runOptions, compilerArgs = []) => {
  const { src, noStrict, verbose } = options
  const { output } = runOptions
  if (!src) throw new Error('Source is not given.')
  const args = [
    ...compilerArgs,
    '--package_json_entry_names', 'module,main',
    '--entry_point', src,
  ]
  const detected = await detect(src, {
    fields: ['externs'],
  })
  const detectedExterns = detected.reduce((acc, { packageJson, externs = [] }) => {
    if (!packageJson) return acc
    const dir = dirname(packageJson)
    externs = Array.isArray(externs) ? externs : [externs]
    externs = externs.map((e) => join(dir, e))
    return [...acc, ...externs]
  }, [])
  detectedExterns.length && console.log('%s %s', c('Modules\' externs:', 'blue'), detectedExterns.join(' '))
  const detectedExternsArgs = createExternsArgs(detectedExterns)
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

  const jsonFiles = hasJsonFiles(detected)
  const hasJson = jsonFiles.length
  if (hasJson) {
    console.log(c('You\'re importing JSON files. Cannot use named exports there.', 'yellow'))
    console.log(' ', jsonFiles.map(({ entry, from }) => {
      return `${entry} [${from.join(' ')}]`
    })
      .join('\n  '))
  }
  const Args = [
    ...args,
    ...externs,
    ...detectedExternsArgs,
    ...(files.length > 1 ? ['--module_resolution', 'NODE'] : []),
    ...(commonJs.length || hasJson ? ['--process_common_js_modules'] : []),
    ...(wrapper ? ['--output_wrapper', wrapper] : []),
    '--js', ...files,
  ]
  verbose ? console.error(Args.join(' ')) : printCommand(args, [
    ...externs, ...detectedExternsArgs,
  ],
  sorted)

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
  const maxLength = process.stderr.columns - 3 || 87
  let lastLineLength = 4
  const s = [...args, ...externs].reduce((acc, current) => {
    if (lastLineLength + current.length > maxLength) {
      acc = acc + ' \\\n' + current
      lastLineLength = current.length
    } else {
      acc = acc + ' ' + current
      lastLineLength += current.length + 1
    }
    return acc
  }, 'java')
    .replace(/--js_output_file (\\\n)?(\S+)/g, (m, b = '', f) => {
      return `--js_output_file ${b}${c(f, 'red')}`
    })
    .replace(/--externs (\\\n)?(\S+)/g, (m, b = '', f) => {
      return `--externs ${b}${c(f, 'grey')}`
    })
    .replace(/--compilation_level (\\\n)?(\S+)/g, (m, b = '', f) => {
      return `--compilation_level ${b}${c(f, 'green')}`
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
import myModule from 'my-module' /* CommonJS Compat */
myModule.method('hello world')
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
  const args = createExternsArgs(p)
  return args
}

const createExternsArgs = (externs) => {
  const args = externs.reduce((acc, e) => {
    return [...acc, '--externs', e]
  }, [])
  return args
}

export default Compile

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('static-analysis').Detection} _staticAnalysis.Detection
 */

/* documentary types/compile.xml */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {_depack.CompileConfig} CompileConfig Options for the Node.JS package compiler.
 */
/**
 * @suppress {nonStandardJsDocs}
 * @typedef {Object} _depack.CompileConfig Options for the Node.JS package compiler.
 * @prop {string} src The entry file to bundle. Currently only single files are supported.
 * @prop {boolean} [noStrict=false] Removes `use strict` from the output. Default `false`.
 * @prop {boolean} [verbose=false] Print all arguments to the compiler. Default `false`.
 * @prop {boolean} [library=false] Whether to create a library. Default `false`.
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
