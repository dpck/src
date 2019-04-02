const r = function (a) {
  ({ callee: a } = a)
  return a
}
const u = function (a) {
  return r(a)
}
const p = function () {
  return u(arguments)
}
;(async () => {
  const res = p()
  console.log(res)
})()
