# @depack/depack

[![npm version](https://badge.fury.io/js/%40depack%2Fdepack.svg)](https://npmjs.org/package/@depack/depack)

`@depack/depack` is The Source Code For Depack's JavaScript API.

```sh
yarn add -E @depack/depack
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async Compile(options: CompileConfig, compilerArgs?: Array)`](#async-compileoptions-compileconfigcompilerargs-array-void)
  * [`CompileConfig`](#type-compileconfig)
- [`async Compile(options: BundleConfig, compilerArgs?: Array)`](#async-compileoptions-bundleconfigcompilerargs-array-void)
  * [`BundleConfig`](#type-bundleconfig)
- [`async run(args: Array, opts: RunConfig)`](#async-runargs-arrayopts-runconfig-void)
  * [`RunConfig`](#type-runconfig)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/0.svg?sanitize=true"></a></p>

## API

The package is available by importing its named functions:

```js
import {
  Compile, Bundle, run,
  getOptions, getOutput,
  GOOGLE_CLOSURE_COMPILER, getCompilerVersion,
} from '@depack/depack'
```

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/1.svg?sanitize=true" width="25"></a></p>

## `async Compile(`<br/>&nbsp;&nbsp;`options: CompileConfig,`<br/>&nbsp;&nbsp;`compilerArgs?: Array,`<br/>`): void`

Compiles a _Node.JS_ package into a single executable (with the `+x` addition). The second argument, `compilerArgs` can come from the `getOptions` method. The output value should come from `getOutput` method to enable saving to directories without specifying the output filename.

__<a name="type-compileconfig">`CompileConfig`</a>__: Options for the Node.JS package compiler.

|      Name       |   Type    |                                          Description                                          | Default |
| --------------- | --------- | --------------------------------------------------------------------------------------------- | ------- |
| __src*__        | _string_  | The entry file to bundle. Currently only single files are supported.                          | -       |
| __output*__     | _string_  | The path where the output will be saved.                                                      | -       |
| noStrict        | _boolean_ | Removes `use strict` from the output.                                                         | `false` |
| verbose         | _boolean_ | Print all arguments to the compiler.                                                          | `false` |
| debug           | _string_  | The name of the file where to save sources after each pass. Useful when there's a bug in GCC. | -       |
| compilerVersion | _string_  | Used in the display message.                                                                  | -       |
| noSourceMap     | _boolean_ | Disables source maps.                                                                         | `false` |

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/2.svg?sanitize=true" width="25"></a></p>

## `async Compile(`<br/>&nbsp;&nbsp;`options: BundleConfig,`<br/>&nbsp;&nbsp;`compilerArgs?: Array,`<br/>`): void`

Bundles source code into a _JavaScript_ file. If there are _JSX_ dependency, the bundler will transpile them first using [ÀLaMode/JSX](https://github.com/a-la/jsx).

__<a name="type-bundleconfig">`BundleConfig`</a>__: Options for the web bundler.

|      Name       |   Type    |                                          Description                                          |    Default    |
| --------------- | --------- | --------------------------------------------------------------------------------------------- | ------------- |
| __src*__        | _string_  | The entry file to bundle. Currently only single files are supported.                          | -             |
| __output*__     | _string_  | The path where the output will be saved.                                                      | -             |
| tempDir         | _string_  | Where to save prepared JSX files.                                                             | `depack-temp` |
| preact          | _boolean_ | Adds `import { h } from 'preact'` automatically.                                              | `false`       |
| debug           | _string_  | The name of the file where to save sources after each pass. Useful when there's a bug in GCC. | -             |
| compilerVersion | _string_  | Used in the display message.                                                                  | -             |
| noSourceMap     | _boolean_ | Disables source maps.                                                                         | `false`       |

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/3.svg?sanitize=true" width="25"></a></p>

## `async run(`<br/>&nbsp;&nbsp;`args: Array,`<br/>&nbsp;&nbsp;`opts: RunConfig,`<br/>`): void`

Low-level API used by `Compile` and `Bundle`. Spawns _Java_ and executes the compilation. To debug a possible bug in the _GCC_, the sources after each pass can be saved to the file specified with the `debug` command. Also, _GCC_ does not add `// # sourceMappingURL=output.map` comment, therefore it's done by this method.

__<a name="type-runconfig">`RunConfig`</a>__: General options for running of the compiler.

|      Name       |   Type    |                                          Description                                          | Default |
| --------------- | --------- | --------------------------------------------------------------------------------------------- | ------- |
| __output*__     | _string_  | The path where the output will be saved.                                                      | -       |
| debug           | _string_  | The name of the file where to save sources after each pass. Useful when there's a bug in GCC. | -       |
| compilerVersion | _string_  | Used in the display message.                                                                  | -       |
| noSourceMap     | _boolean_ | Disables source maps.                                                                         | `false` |

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/4.svg?sanitize=true" width="25"></a></p>

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/5.svg?sanitize=true"></a></p>


## Copyright

<table>
  <tr>
    <th>
      <a href="https://artd.eco">
        <img src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png" alt="Art Deco" />
      </a>
    </th>
    <th>© <a href="https://artd.eco">Art Deco</a> for <a href="https://artd.eco/depack">Depack</a> 2019</th>
    <th>
      <a href="https://www.technation.sucks" title="Tech Nation Visa">
        <img src="https://raw.githubusercontent.com/artdecoweb/www.technation.sucks/master/anim.gif"
          alt="Tech Nation Visa" />
      </a>
    </th>
    <th><a href="https://www.technation.sucks">Tech Nation Visa Sucks</a></th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents"><img src=".documentary/section-breaks/-1.svg?sanitize=true"></a></p>