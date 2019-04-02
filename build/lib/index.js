const { c, b } = require('erte');
const { basename, relative } = require('path');
const { write, read } = require('@wrote/wrote');

/**
 * Returns the pretty-printed command for the bundler.
 * @param {Array<string>} args The array with arguments.
 * @param {(string):string} getJs The function to get the location of the js file to print.
 */
       const getCommand = (args, js) => {
  // const js = []
  const a = args.join(' ')
    // .replace(/--js (\S+)\s*/g, (m, f) => {
    //   const j = `  --js ${c(getJs(f), 'green')}`
    //   js.push(j)
    //   return ''
    // })
    .replace(/--compilation_level (\S+)/g, (m, f) => {
      return `--compilation_level ${b(f, 'green')}`
    })
    .replace(/--js_output_file (\S+)/g, (m, f) => {
      return `--js_output_file ${c(f, 'red')}`
    })
  const jss = js.map((file) => {
    const j = `${c(file, 'green')}`
    return j
  }).join('\n     ')
  return `${a}\n--js ${jss}`.trim()
}

       const addSourceMap = async (path) => {
  const name = basename(path)
  const r = await read(path)
  const s = [r, '//' + `# sourceMappingURL=${name}.map`].join('\n')
  await write(path, s)
}

       const removeStrict = async (path, wrapper, noStrict) => {
  const r = await read(path)
  const prepared = prepareOutput(r, wrapper, noStrict)
  await write(path, prepared)
}

// fixes 'use strict' to be on top
       const prepareOutput = (output, wrapper = '', noStrict) => {
  const wp = wrapper.replace(/%output%$/, '')
  const actualOutput = output.replace(wp, '')
  const hasUseStrict = actualOutput.startsWith('\'use strict\';')
  const ao = actualOutput.replace(/'use strict';/, ' '.repeat(13))
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
 * @param {Array<string>} internals The list of internal modules used in the program.
 * @param {boolean} noStrict Does not add 'use strict' mode.
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
    .join('\n') + '%output%'
  return `#!/usr/bin/env node
'use strict';
${wrapper}`
}

/**
 * Checks whether static analysis returned .json files.
 * @param {Array<import('static-analysis').Detection>} detected
 */
       const hasJsonFiles = detected => detected.some(({ entry }) => {
  if (entry)
    return entry.endsWith('.json')
})

module.exports.getCommand = getCommand
module.exports.addSourceMap = addSourceMap
module.exports.removeStrict = removeStrict
module.exports.prepareOutput = prepareOutput
module.exports.updateSourceMaps = updateSourceMaps
module.exports.checkIfLib = checkIfLib
module.exports.getWrapper = getWrapper
module.exports.hasJsonFiles = hasJsonFiles