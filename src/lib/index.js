import { c, b } from 'erte'
import { basename, relative } from 'path'
import { write, read } from '@wrote/wrote'

/**
 * Returns the pretty-printed command for the bundler.
 * @param {Array<string>} args The array with arguments.
 * @param {(string):string} getJs The function to get the location of the js file to print.
 */
export const getCommand = (args, js) => {
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

export const addSourceMap = async (path) => {
  const name = basename(path)
  const r = await read(path)
  const s = [r, '//' + `# sourceMappingURL=${name}.map`].join('\n')
  await write(path, s)
}

export const removeStrict = async (path) => {
  const r = await read(path)
  const s = r.replace(/^'use strict';/m, ' '.repeat(13))
  await write(path, s)
}

export const updateSourceMaps = async (path, tempDir) => {
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
export const checkIfLib = modName => /^[./]/.test(modName)

/**
 * Gets the wrapper to for the output to enable requiring Node.js modules.
 * @param {Array<string>} internals The list of internal modules used in the program.
 * @example
 * const fs = require('fs');
 * const _module = require('module');
 */
export const getWrapper = (internals) => {
  if (!internals.length) return
  const wrapper = internals
    .map(i => {
      const m = i == 'module' ? '_module' : i
      return `const ${m} = r` + `equire('${i}');` // prevent
    })
    .join('\n') + '\n%output%'
  return `#!/usr/bin/env node\n${wrapper}`
}

/**
 * Checks whether static analysis returned .json files.
 * @param {Array<import('static-analysis').Detection>} detected
 */
export const hasJsonFiles = detected => detected.some(({ entry }) => {
  if (entry)
    return entry.endsWith('.json')
})