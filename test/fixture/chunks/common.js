// common.js
export const common = (opts = {}) => {
  const { a } = opts
  if (window.DEBUG && a) console.log('test')
}