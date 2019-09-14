const { c, b } = require('erte');
const { join, dirname, basename, relative } = require('path');
const { write, read } = require('@wrote/wrote');
const { builtinModules } = require('module');

const replaceWithColor = (str, name, color, background = false) => {
  const re = new RegExp(`--${name} (\\\\\n)?(\\S+)`, 'g')
  return str.replace(re, (m, bef, f) => {
    const fn = background ? b : c
    return `--${name} ${bef || ''}${fn(f, color)}`
  })
}

/**
 * Returns the pretty-printed command for the bundler.
 * @param {!Array<string>} args The array with arguments.
 * @param {!Array<string>} js The list of js files and chunks.
 */
const getCommand = (args, js) => {
  let s = getShellCommand(args)

  s = replaceWithColor(s, 'compilation_level', 'green', true)
  s = replaceWithColor(s, 'js_output_file', 'red')

  const sep = '\n     '
  const jss = js.filter(a => a != '--js').map((file, i, a) => {
    if (file == '--chunk') {
      return `${file} `
      // return `${c(file, 'magenta')} `
    } else if (a[i-1] == '--chunk') {
      return `${c(file, 'magenta')}${sep}`
    }
    let j = `${c(file, 'green')}`
    if (a.length - 1 == i) return j
    if (a[i + 1] == '--chunk') return `${j}\n`
    //${(a.length - 1 != i && a[i + 1] != '--chunk') ? sep : ''}`
    return `${j}${sep}`
  }).join('')
  // .join('\n     ')
  return `${s}\n--js ${jss}`.trim()
}

const addData = async (path, { sourceMap }) => {
  const r = await read(path)
  const rr = [r]
  if (sourceMap) {
    const name = basename(path)
    rr.push('//' + `# sourceMappingURL=${name}.map`)
  }
  await write(path, rr.join('\n'))
}

const removeStrict = async (path, wrapper = '', noStrict = false) => {
  // if we compiled a library, GCC would already not have use strict
  // as compared to the compile mode where we added #!/usr/bin/env node
  // on top which resulted in an extra 'use strict' after the wrapper
  if (wrapper.startsWith('\'use strict\'') && !noStrict) return
  const r = await read(path)
  const prepared = prepareOutput(r, wrapper, noStrict)
  await write(path, prepared)
}

// fixes 'use strict' to be on top
const prepareOutput = (output, wrapper = '', noStrict = false) => {
  const wp = wrapper.replace(/%output%$/, '')
  const actualOutput = output.replace(wp, '')
  const hasUseStrict = actualOutput.startsWith('\'use strict\';')
  let ao = actualOutput
  if (wrapper || noStrict)
    ao = actualOutput.replace(/'use strict';/, ' '.repeat(13))
  const aw = noStrict || !hasUseStrict ? wp.replace(/'use strict';/, ' '.repeat(13)) : wp
  return `${aw}${ao}`
}

const updateSourceMaps = async (path, tempDir) => {
  const map = `${path}.map`
  const r = await read(map)
  const j = JSON.parse(r)
  const { 'sources': sources } = j
  const newSources = sources.map(s => {
    if (s.startsWith(' ')) return s
    return `/${relative(tempDir, s)}`
  })
  j['sources'] = newSources
  const jj = JSON.stringify(j, null, 2)
  await write(map, jj)
}

/**
 * Returns whether the dependency is a library from the package.
 * @param {string} modName
 * @example
 * checkIfLib('./lib') // true
 * checkIfLib('preact') // false
 */
const checkIfLib = modName => /^[./]/.test(modName)

/**
 * Gets the wrapper to for the output to enable requiring Node.js modules.
 * @param {!Array<string>} internals The list of internal modules used in the program.
 * @example
 * const fs = require('fs');
 * const _module = require('module');
 */
const getWrapper = (internals) => {
  if (!internals.length) return
  const wrapper = internals
    .map(i => {
      let m = i
      if (['module', 'process', 'console', 'crypto'].includes(i)) m = `_${i}`
      return `const ${m} = r` + `equire('${i}');` // prevent
    })
    .join('\n') + '%output%'
  return `#!/usr/bin/env node
'use strict';
${wrapper}`
}

/**
 * Checks whether static analysis returned .json files.
 * @param {!Array<!_staticAnalysis.Detection>} detected
 */
const hasJsonFiles = detected => detected.filter(({ entry }) => {
  if (entry)
    return entry.endsWith('.json')
})

const { DEPACK_MAX_COLUMNS = 87 } = process.env

const getShellCommand = (args, program = 'java') => {
  const maxLength = process.stderr.columns - 3 || DEPACK_MAX_COLUMNS
  let lastLineLength = program.length
  const s = args.reduce((acc, current) => {
    if (lastLineLength + current.length > maxLength) {
      acc = acc + ' \\\n' + current
      lastLineLength = current.length
    } else {
      acc = acc + ' ' + current
      lastLineLength += current.length + 1
    }
    return acc
  }, program)
  return s
}

/**
 * Runs through detected packages and returns the list of externs specified in the `externs` field.
 * @param {!Array<!_staticAnalysis.Detection>} detected
 */
const detectExterns = (detected) => {
  /** @type {!Array<string>} */
  const nodeJS = []
  /** @type {!Array<string>} */
  const detectedExterns = detected.reduce((acc, { packageJson, 'externs': externs = [] }) => {
    if (!packageJson) return acc
    const dir = dirname(packageJson)
    externs = Array.isArray(externs) ? externs : [externs]
    externs = externs.filter((e) => {
      if (builtinModules.includes(e)) {
        nodeJS.push(e)
        return false
      }
      return true
    })
    const actual = externs.map((e) => join(dir, e))
    return [...acc, ...actual]
  }, [])
  return { detectedExterns, nodeJS }
}

const createExternsArgs = (externs) => {
  const args = externs.reduce((acc, e) => {
    return [...acc, '--externs', e]
  }, [])
  return args
}

const unique = (e, i, a) => a.indexOf(e) == i

const updateTempDirArgs = (args, tempDir) => {
  return args.map((j) => {
    return j.startsWith(tempDir) ? relative(tempDir, j) : j
  })
}

const getBundleArgs = (compilerArgs, externs, output, noSourceMap, deps, processCommonJs) => {
  const args = [
    ...compilerArgs,
    ...externs,
    ...(output && !noSourceMap ? ['--source_map_include_content'] : []),
    ...(deps.length > 1 ? ['--module_resolution', 'NODE'] : []),
    ...(processCommonJs ? ['--process_common_js_modules'] : []),
  ]
  return args
}

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('static-analysis').Detection} _staticAnalysis.Detection
 */

module.exports.replaceWithColor = replaceWithColor
module.exports.getCommand = getCommand
module.exports.addData = addData
module.exports.removeStrict = removeStrict
module.exports.prepareOutput = prepareOutput
module.exports.updateSourceMaps = updateSourceMaps
module.exports.checkIfLib = checkIfLib
module.exports.getWrapper = getWrapper
module.exports.hasJsonFiles = hasJsonFiles
module.exports.getShellCommand = getShellCommand
module.exports.detectExterns = detectExterns
module.exports.createExternsArgs = createExternsArgs
module.exports.unique = unique
module.exports.updateTempDirArgs = updateTempDirArgs
module.exports.getBundleArgs = getBundleArgs