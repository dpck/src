import { c } from 'erte'
import { join, dirname, relative } from 'path'
import { ensurePath, write, read, exists } from '@wrote/wrote'
// import getCorePath from '@depack/nodejs'
import resolveDependency from 'resolve-dependency'

/**
 * Create an error with color.
 * @param {number} exitCode
 * @param {string} se The output of the compiler.
 */
export const makeError = (exitCode, se) => {
  const r = se.split('\n\n')
  const s = r.map((t) => {
    const warn = /^.+?:\d+:(?:\s*Originally at:\s*.+?)? WARNING -/.test(t)
    if (warn) return c(t, 'grey')
    return c(t, 'red')
  }).join('\n\n')

  const er = `Exit code ${exitCode}\n${s}`
  return er
}


const getCoreVersion = () => {
  let [VER] = process.version.split('.', 1)
  const V = VER.replace(/[^\d]/g, '')
  if (V > 8 || V < 8) {
    console.log('Your Node.JS version is %s but only externs for v8 are available at the moment. ' +
      'This can result in compiler warnings.', VER)
    VER = 'v8'
  }
  return VER
}

/**
 * Creates mocks in the `node_module` folder to serve as externs. It is not possible to serve proxies not from `node_modules` path because Closure does not understand it.
 * @param {!Object} opts
 * @param {!Array<string>} opts.internals The names of the core modules to prepare.
 * @param {string} [opts.nodeModulesPath] The path to the node_modules folder in which to put the core mocks. Default `node_modules`.
 * @param {boolean} [opts.force] Whether to force override. Default `true`.
 * @todo Add an option to dynamically evaluate the content of the mock.
 */
export const prepareCoreModules = async ({
  internals, nodeModulesPath = 'node_modules', force = true,
}) => {
  const VER = getCoreVersion()
  const getCorePath = require(/*ok depack*/'@depack/nodejs')
  const corePath = getCorePath(VER)
  const r = await Promise.all(internals.map(async (name) => {
    const path = join(nodeModulesPath, name)
    const packageJson = join(path, 'package.json')
    const index = join(path, 'index.js')
    const ret = { packageJson, index }

    const e = await exists(packageJson)
    if (e && !force) {
      const depackExist = await testDepack(packageJson)
      if (depackExist && depackExist == VER) return ret
      else
        throw new Error(`Could not prepare core module ${name}: ${path} exists.`)
    }
    await ensurePath(packageJson)
    await write(packageJson, JSON.stringify({
      'name': name, 'module': 'index.js', 'depack': VER,
    }))
    const core = await read(join(corePath, `${name}.js`))
    await write(index, core)
    return ret
  }))
  return r.reduce((acc, { packageJson, index }) => {
    return [...acc, packageJson, index]
  }, [])
}

/**
 * Check whether the package has the depack property meaning it is a mock and was created by `prepareCoreModules` earlier. Returns the version of Node when the core package was simulated in `node_modules`.
 */
const testDepack = async (packageJson) => {
  try {
    const testPackage = await read(packageJson)
    const { 'depack': depack } = JSON.parse(testPackage)
    return depack
  } catch (err) { /* */ }
}

/**
 * Update dependencies' package.json files to point to a file and not a directory. * https://github.com/google/closure-compiler/issues/3149
 * @param {!Array<string>} commonJS The paths to CommonJS package.json files.
 * @param {!Array<string>} modules The paths to package.json files.
 */
export const fixDependencies = async (commonJS, modules) => {
  const all = [...commonJS, ...modules]
  await Promise.all(all.map(async (dep) => {
    const dir = dirname(dep)
    const f = await read(dep)
    const p = JSON.parse(f)
    const { 'main': main, 'module': mod } = p
    const isModule = !!mod
    const field = isModule ? 'module' : 'main'
    let M = mod || main
    if (!M) {
      const j = join(dirname(dep), 'index.js')
      const e = await exists(j)
      if (!e) throw new Error(`Package ${dep} does not specify either main or module fields, and does not contain the index.js file.`)
      p['main'] = 'index.js'
      console.warn('Updating %s to have the main field.', dep)
      await write(dep, JSON.stringify(p, null, 2))
    }
    let isDir, path
    try {
      ({ isDir, path } = await resolveDependency(M, dep))
    } catch (err) {
      throw new Error(`The ${field} for dependency ${dep} does not exist.`)
    }
    if (isDir) {
      const newM = join(M, 'index.js')
      p[field] = newM
      console.warn('Updating %s to point to a file.', dep)
      await write(dep, JSON.stringify(p, null, 2))
    } else if (join(dir, p[field]) != path) {
      const relPath = relative(dir, path)
      p[field] = relPath
      console.warn('Updating %s to point to the file with extension.', dep)
      await write(dep, JSON.stringify(p, null, 2))
    }
  }))
}