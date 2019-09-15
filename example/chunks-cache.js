import { BundleChunks } from '../src'
import stat from 'async-stat'

const compileOurChunks = async (srcs) => {
  let cachedMap, needsCacheUpdate

  let map = await BundleChunks({
    srcs,
    preactExtern: true,
    async checkCache(analysis) {
      // somehow get the cache object: { chunksMap, files, deps }
      const { chunksMap, ...current } = splendid.getCache('compile-comps')
      cachedMap = chunksMap
      const deps = {}
      const entries = []
      analysis.forEach(({ name, version, entry }) =>  {
        if (name) deps[name] = version
        else entries.push(entry)
      })
      const files = await entries.reduce(async (acc, file) => {
        const accRes = await acc
        /** @type {import('fs').Stats} */
        const ls = await stat(file)
        const d = new Date(ls.mtimeMs).toLocaleString()
        accRes[file] = d
        return accRes
      }, {})
      try {
        deepEqual({ files, deps }, current, ' ')
        // this is now OK, should not need to do anything else
        splendid.log2('compile-comps', 'Comps not changed.')
        return true
      } catch (err) {
        splendid.log2('compile-comps', err.message)
        needsCacheUpdate = err.actual
      }
    },
  }, { compilerVersion, output }, options)

  if (needsCacheUpdate) {
    needsCacheUpdate.chunksMap = map
    // save new cache: { chunksMap, files, deps }
    await splendid.appendCache('compile-comps', needsCacheUpdate)
  } else if (!map) {
    map = cachedMap
  }
  return map
}