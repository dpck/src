# @depack/depack

[![npm version](https://badge.fury.io/js/%40depack%2Fdepack.svg)](https://npmjs.org/package/@depack/depack)

`@depack/depack` is The Source Code For Depack's JavaScript API.

```sh
yarn add -E @depack/depack
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`src(arg1: string, arg2?: boolean)`](#srcarg1-stringarg2-boolean-void)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its default function:

```js
import src from '@depack/depack'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true"></a></p>

## `src(`<br/>&nbsp;&nbsp;`arg1: string,`<br/>&nbsp;&nbsp;`arg2?: boolean,`<br/>`): void`

Call this function to get the result you want.



```js
/* alanode example/ */
import src from '@depack/depack'

(async () => {
  const res = await src({
    text: 'example',
  })
  console.log(res)
})()
```
```

```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true"></a></p>

## Copyright

(c) [Art Deco][1] 2019

[1]: https://artd.eco/depack

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>