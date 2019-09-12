import { BundleChunks, getOptions } from '../src'
import TempContext from 'temp-context'

(async () => {
  const t = new TempContext()
  await t._init()
  const { TEMP } = t
  /* start example */
  const options = getOptions({
    chunkOutput: TEMP,
    advanced: true,
    sourceMap: false,
  })
  await BundleChunks({
    silent: true,
    srcs: ['test/fixture/chunkA.js', 'test/fixture/chunkB.js'],
  }, { output: TEMP, noSourceMap: true }, options)
  /* end example */
  console.log((await t.snapshot()))
})()