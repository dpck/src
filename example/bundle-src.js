/* eslint-env browser */
[...document.querySelectorAll('.BananaInactive')]
  .forEach((el) => {
    const parent = el.closest('.BananaCheck')
    el.onclick = () => {
      parent.classList.add('BananaActivated')
    }
  })
;[...document.querySelectorAll('.BananaActive')]
  .forEach((el) => {
    const parent = el.closest('.BananaCheck')
    el.onclick = () => {
      parent.classList.remove('BananaActivated')
    }
  })