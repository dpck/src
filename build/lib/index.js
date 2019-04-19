const { c, b } = require('erte');
const { basename, relative } = require('path');
const { write, read } = require('@wrote/wrote');

/**
 * Returns the pretty-printed command for the bundler.
 * @param {!Array<string>} args The array with arguments.
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

       const addData = async (path, { sourceMap, library }) => {
  const r = await read(path)
  const rr = [r]
  if (library) rr.push('module.exports = DEPACK_EXPORT')
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
       const prepareOutput = (output, wrapper = '', noStrict) => {
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
 * @param {boolean} [library=false] Whether to create a library.
 * @example
 * const fs = require('fs');
 * const _module = require('module');
 */
       const getWrapper = (internals, library = false) => {
  if (!internals.length) return
  const wrapper = internals
    .map(i => {
      let m = i
      if (['module', 'process', 'console', 'crypto'].includes(i)) m = `_${i}`
      return `const ${m} = r` + `equire('${i}');` // prevent
    })
    .join('\n') + '%output%'
  if (library) {
    return `'use strict';
let DEPACK_EXPORT;
${wrapper}`
  }
  return `#!/usr/bin/env node
'use strict';
${wrapper}`
}

/**
 * Checks whether static analysis returned .json files.
 * @param {!Array<_staticAnalysis.Detection>} detected
 */
       const hasJsonFiles = detected => detected.filter(({ entry }) => {
  if (entry)
    return entry.endsWith('.json')
})

/**
 * @suppress {nonStandardJsDocs}
 * @typedef {import('static-analysis').Detection} _staticAnalysis.Detection
 */

module.exports.getCommand = getCommand
module.exports.addData = addData
module.exports.removeStrict = removeStrict
module.exports.prepareOutput = prepareOutput
module.exports.updateSourceMaps = updateSourceMaps
module.exports.checkIfLib = checkIfLib
module.exports.getWrapper = getWrapper
module.exports.hasJsonFiles = hasJsonFiles