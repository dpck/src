/* alanode example/ */
import src from '../src'

(async () => {
  const res = await src({
    text: 'example',
  })
  console.log(res)
})()