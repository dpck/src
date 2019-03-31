const { c } = require('erte');
const { basename, relative } = require('path');
const { write, read } = require('@wrote/wrote');

/**
 * Returns the pretty-printed command.
 * @param {Array<string>} args The array with arguments.
 * @param {(string):string} getJs The function to get the location of the js file to print.
 */
       const getCommand = (args, getJs = js => js) => {
  const js = []
  const a = args.join(' ')
    .replace(/--js (\S+)\s*/g, (m, f) => {
      const j = `  --js ${c(getJs(f), 'green')}`
      js.push(j)
      return ''
    })
    .replace(/--externs (\S+)/g, (m, f) => {
      return `\n  --externs ${c(f, 'grey')}`
    })
    .replace(/--js_output_file (\S+)/g, (m, f) => {
      return `\n  --js_output_file ${c(f, 'red')}`
    })
  const jss = js.join('\n')
  return `${a}\n${jss}`
}

       const addSourceMap = async (path) => {
  const name = basename(path)
  const r = await read(path)
  const s = [r, '//' + `# sourceMappingURL=${name}.map`].join('\n')
  await write(path, s)
}

       const removeStrict = async (path) => {
  const r = await read(path)
  const s = r.replace(/^'use strict';/m, ' '.repeat(13))
  await write(path, s)
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
 * @param {Array<string>} internals The list of internal modules used in the program.
 * @example
 * const fs = require('fs');
 * const _module = require('module');
 */
       const getWrapper = (internals) => {
  if (!internals.length) return
  const wrapper = internals
    .map(i => {
      const m = i == 'module' ? '_module' : i
      return `const ${m} = r` + `equire('${i}');` // prevent
    })
    .join('\n') + '\n%output%'
  return `#!/usr/bin/env node\n${wrapper}`
}

module.exports.getCommand = getCommand
module.exports.addSourceMap = addSourceMap
module.exports.removeStrict = removeStrict
module.exports.updateSourceMaps = updateSourceMaps
module.exports.checkIfLib = checkIfLib
module.exports.getWrapper = getWrapper