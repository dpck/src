# @depack/depack

[![npm version](https://badge.fury.io/js/%40depack%2Fdepack.svg)](https://npmjs.org/package/@depack/depack)

`@depack/depack` is The Source Code For Depack's JavaScript API. [_Depack_](https://github.com/dpck/depack) is the compiler of _Node.JS_ packages into a single executable, as well as the bundler for JavaScript web files using _Google Closure Compiler_. It scans the entry files to detect all dependencies, to passes them to _GCC_.

```sh
yarn add -E @depack/depack
```

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
- [`async run(args, opts): string`](#async-runargs-arraystringopts-runconfig-string)
  * [`RunConfig`](#type-runconfig)
- [`async Compile(options: CompileConfig, runOptions: RunConfig, compilerArgs?: Array)`](#async-compileoptions-compileconfigrunoptions-runconfigcompilerargs-array-void)
  * [`CompileConfig`](#type-compileconfig)
- [`async Bundle(options: BundleConfig, runOptions: RunConfig, compilerArgs?: Array)`](#async-bundleoptions-bundleconfigrunoptions-runconfigcompilerargs-array-void)
  * [`BundleConfig`](#type-bundleconfig)
- [`getOptions(options: GetOptions): Array<string>`](#getoptionsoptions-getoptions-array)
  * [`GetOptions`](#type-getoptions)
- [`getOutput(output: string, src?: string): string`](#getoutputoutput-stringsrc-string-string)
- [`GOOGLE_CLOSURE_COMPILER: string`](#googleclosurecompiler-string)
- [`async getCompilerVersion(): string`](#async-getcompilerversion-string)
- [Copyright](#copyright)

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/0.svg?sanitize=true">
</a></p>

## API

The package is available by importing its named functions:

```js
import {
  Compile, Bundle, run,
  getOptions, getOutput,
  GOOGLE_CLOSURE_COMPILER, getCompilerVersion,
} from '@depack/depack'
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/1.svg?sanitize=true" width="25">
</a></p>

## <code>async <ins>run</ins>(</code><sub><br/>&nbsp;&nbsp;`args: !Array<string>,`<br/>&nbsp;&nbsp;`opts: !RunConfig,`<br/></sub><code>): <i>string</i></code>
Spawns a Java process and executes the compilation. Returns the _stdout_ of the Java process.

 - <kbd><strong>args*</strong></kbd> <em><code>!Array&lt;string&gt;</code></em>: The arguments to Java.
 - <kbd><strong>opts*</strong></kbd> <em><code><a href="#type-runconfig" title="General options for running of the compiler.">!RunConfig</a></code></em>: General options for running of the compiler.

Low-level API used by `Compile` and `Bundle`. Spawns _Java_ and executes the compilation. To debug a possible bug in the _GCC_, the sources after each pass can be saved to the file specified with the `debug` command. Also, _GCC_ does not add `// # sourceMappingURL=output.map` comment, therefore it's done by this method. Returns `stdout` of the _Java_ process.

__<a name="type-runconfig">`RunConfig`</a>__: General options for running of the compiler.
<table>
 <thead><tr>
  <th>Name</th>
  <th>Type &amp; Description</th>
  <th>Default</th>
 </tr></thead>
 <tr>
  <td rowSpan="3" align="center">output</td>
  <td><em>string</em></td>
  <td rowSpan="3">-</td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The path where the output will be saved. Prints to <code>stdout</code> if not passed.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">debug</td>
  <td><em>string</em></td>
  <td rowSpan="3">-</td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   The name of the file where to save sources after each pass. Useful when there's a bug in GCC.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">compilerVersion</td>
  <td><em>string</em></td>
  <td rowSpan="3">-</td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   Used in the display message.
  </td>
 </tr>
 <tr>
  <td rowSpan="3" align="center">noSourceMap</td>
  <td><em>boolean</em></td>
  <td rowSpan="3"><code>false</code></td>
 </tr>
 <tr></tr>
 <tr>
  <td>
   Disables source maps.
  </td>
 </tr>
</table>

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/2.svg?sanitize=true">
</a></p>

## <code>async <ins>Compile</ins>(</code><sub><br/>&nbsp;&nbsp;`options: CompileConfig,`<br/>&nbsp;&nbsp;`runOptions: RunConfig,`<br/>&nbsp;&nbsp;`compilerArgs?: Array,`<br/></sub><code>): <i>void</i></code>

Compiles a _Node.JS_ package into a single executable (with the `+x` addition). Performs regex-based static analysis of the whole of the dependency tree to construct the list of JS files. If any of the files use `require`, adds the `--process_common_js_modules` flag. The actual logic that makes compilation of _Node.JS_ packages possible is:

- Scan the source code and dependency to find out what internal Node.JS modules are used, and creates the output wrapper with `require` calls to require those built-in modules, e.g., `const path = require('path')`.
- Add appropriate [externs](https://github.com/dpck/externs) for the internal modules.
- To make Closure resolve internal imports like `import { join } from 'path'` instead of throwing an error, mock the built-ins in `node_modules` folder. The mocks will reference the variable from the output wrapper generated in step 1:
    ```js
    // node_modules/path/index.js
    export default path
    export * from path
    ```

The last argument, `compilerArgs` can come from the `getOptions` method. The output property should come from `getOutput` method to enable saving to directories without specifying the output filename (_GCC_ will do it automatically, but we need to write source maps and set `+x`).

__<a name="type-compileconfig">`CompileConfig`</a>__: Options for the Node.JS package compiler.

|   Name   |       Type       |                             Description                              | Default |
| -------- | ---------------- | -------------------------------------------------------------------- | ------- |
| __src*__ | <em>string</em>  | The entry file to bundle. Currently only single files are supported. | -       |
| noStrict | <em>boolean</em> | Removes `use strict` from the output.                                | `false` |
| verbose  | <em>boolean</em> | Print all arguments to the compiler.                                 | `false` |
| library  | <em>boolean</em> | Whether to create a library.                                         | `false` |

_For example, given the following source:_

```js
import { constants } from 'os'
import { createWriteStream, createReadStream } from 'fs'

;(async () => {
  const result = await new Promise((r, j) => {
    const input = process.env['INPUT'] || __filename
    const output = process.env['OUTPUT']
    const rs = createReadStream(input)
    const ws = output ? createWriteStream(output) : process.stdout
    rs.pipe(ws)
    rs.on('error', (err) => {
      if (err.errno === -constants.errno.ENOENT) {
        return j(`Cannot find file ${input}`)
      }
      return j(err)
    })
    rs.on('close', () => {
      r({ input, 'output': output })
    })
  })
  const res = {
    version: process.version,
    ...result,
  }
  console.log(res)
})()
```

_The library can be used to start the compilation:_

```js
import { getCompilerVersion, Compile, getOptions } from '@depack/depack'

(async () => {
  const compilerVersion = await getCompilerVersion()
  const options = getOptions({
    advanced: true,
    prettyPrint: true,
    languageIn: 2018,
    languageOut: 2017,
  })
  await Compile({
    src: 'example/compile-src.js',
  }, { compilerVersion }, options)
})()
```

_The compiled output in pretty format of advanced optimisation:_
```js
#!/usr/bin/env node
'use strict';
const os = require('os');
const fs = require('fs');             
const {constants:g} = os;
const {createReadStream:h, createWriteStream:k} = fs;
(async() => {
  var d = await new Promise((l, e) => {
    const a = process.env.INPUT || __filename, b = process.env.OUTPUT, c = h(a), m = b ? k(b) : process.stdout;
    c.pipe(m);
    c.on("error", f => f.errno === -g.errno.ENOENT ? e(`Cannot find file ${a}`) : e(f));
    c.on("close", () => {
      l({input:a, output:b});
    });
  });
  d = Object.assign({}, {version:process.version}, d);
  console.log(d);
})();
```

_Stderr:_
```
java -jar /Users/zavr/node_modules/google-closure-compiler-java/compiler.jar \
--compilation_level ADVANCED --language_in ECMASCRIPT_2018 --language_out \
ECMASCRIPT_2017 --formatting PRETTY_PRINT --package_json_entry_names module,main \
--entry_point example/compile-src.js --externs node_modules/@depack/externs/v8/os.js \
--externs node_modules/@depack/externs/v8/fs.js --externs \
node_modules/@depack/externs/v8/stream.js --externs \
node_modules/@depack/externs/v8/events.js --externs \
node_modules/@depack/externs/v8/url.js --externs \
node_modules/@depack/externs/v8/global.js --externs \
node_modules/@depack/externs/v8/global/buffer.js --externs \
node_modules/@depack/externs/v8/nodejs.js
Built-ins: os, fs
Running Google Closure Compiler 20190709...         
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/3.svg?sanitize=true" width="25">
</a></p>

## <code>async <ins>Bundle</ins>(</code><sub><br/>&nbsp;&nbsp;`options: BundleConfig,`<br/>&nbsp;&nbsp;`runOptions: RunConfig,`<br/>&nbsp;&nbsp;`compilerArgs?: Array,`<br/></sub><code>): <i>void</i></code>

Bundles source code into a _JavaScript_ file. If there are _JSX_ dependencies, the bundler will transpile them first using [ÀLaMode/JSX](https://github.com/a-la/jsx).

__<a name="type-bundleconfig">`BundleConfig`</a>__: Options for the web bundler.

|     Name     |       Type       |                                                                                                                             Description                                                                                                                              |    Default    |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| __src*__     | <em>string</em>  | The entry file to bundle. Currently only single files are supported.                                                                                                                                                                                                 | -             |
| tempDir      | <em>string</em>  | Where to save prepared JSX files.                                                                                                                                                                                                                                    | `depack-temp` |
| preact       | <em>boolean</em> | Adds `import { h } from 'preact'` automatically, so that the bundle will be compiled **together** with _Preact_.                                                                                                                                                     | `false`       |
| preactExtern | <em>boolean</em> | Adds `import { h } from '＠preact/extern'` automatically, assuming that `preact` will be available in the global scope won't be included in the compilation. It will also rename any `preact` imports into `＠externs/preact`, so that the source code stays the same. | `false`       |

_For example, given the following single JS source:_

```js
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
```

_Depack is used to make a JS file in ES2015 understood by old browsers:_

```js
import { getCompilerVersion, Bundle, getOptions } from '@depack/depack'

(async () => {
  const compilerVersion = await getCompilerVersion()
  const options = getOptions({
    advanced: true,
    prettyPrint: true,
  })
  await Bundle({
    src: 'example/bundle-src.js',
  }, { compilerVersion }, options)
})()
```

_The bundled output:_
```js
function c(a) {
  var b = 0;
  return function() {
    return b < a.length ? {done:!1, value:a[b++]} : {done:!0};
  };
}
function e(a) {
  if (!(a instanceof Array)) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    a = b ? b.call(a) : {next:c(a)};
    for (var d = []; !(b = a.next()).done;) {
      d.push(b.value);
    }
    a = d;
  }
  return a;
}
[].concat(e(document.querySelectorAll(".BananaInactive"))).forEach(function(a) {
  var b = a.closest(".BananaCheck");
  a.onclick = function() {
    b.classList.add("BananaActivated");
  };
});
[].concat(e(document.querySelectorAll(".BananaActive"))).forEach(function(a) {
  var b = a.closest(".BananaCheck");
  a.onclick = function() {
    b.classList.remove("BananaActivated");
  };
});
```

_Stderr:_
```
java -jar /Users/zavr/node_modules/google-closure-compiler-java/compiler.jar \
--compilation_level ADVANCED --formatting PRETTY_PRINT
--js example/bundle-src.js
Running Google Closure Compiler 20190709..          
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/4.svg?sanitize=true" width="25">
</a></p>

## <code><ins>getOptions</ins>(</code><sub><br/>&nbsp;&nbsp;`options: GetOptions,`<br/></sub><code>): <i>Array<string></i></code>

Returns an array of options to pass to the compiler for `Compile` and `Bundle` methods.

__<a name="type-getoptions">`GetOptions`</a>__: Parameters for `getOptions`. https://github.com/google/closure-compiler/wiki/Flags-and-Options

|    Name     |             Type              |                                                         Description                                                          | Default |
| ----------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| compiler    | <em>string</em>               | The path to the compiler JAR. Default value will be got from `require.resolve('google-closure-compiler-java/compiler.jar')`. | -       |
| output      | <em>string</em>               | Sets the `--js_output_file` flag.                                                                                            | -       |
| level       | <em>string</em>               | Sets the `--compilation_level` flag.                                                                                         | -       |
| advanced    | <em>boolean</em>              | Sets the `--compilation_level` flag to `ADVANCED`.                                                                           | `false` |
| languageIn  | <em>(string \| number)</em>   | Sets the `--language_in` flag. If a year is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.                         | -       |
| languageOut | <em>(string \| number)</em>   | Sets the `--language_out` flag. If a number is passed, adjusts it to `ECMASCRIPT_{YEAR}` automatically.                      | -       |
| sourceMap   | <em>boolean</em>              | Adds the `--create_source_map %outname%.map` flag.                                                                           | `true`  |
| prettyPrint | <em>boolean</em>              | Adds the `--formatting PRETTY_PRINT` flag.                                                                                   | `false` |
| iife        | <em>boolean</em>              | Adds the `--isolation_mode IIFE` flag.                                                                                       | `false` |
| noWarnings  | <em>boolean</em>              | Sets the `--warning_level QUIET` flag.                                                                                       | `false` |
| debug       | <em>string</em>               | The location of the file where to save sources after each pass. Disables source maps as these 2 options are incompatible.    | -       |
| argv        | <em>!Array&lt;string&gt;</em> | Any additional arguments to the compiler.                                                                                    | -       |

```js
import { getOptions } from '@depack/depack'

const opts = getOptions({
  advanced: true,
  iife: true,
  languageIn: 2019,
  languageOut: 2017,
  noWarnings: true,
  prettyPrint: true,
  output: 'bundle.js',
  argv: ['--externs', 'externs.js'],
})
console.log(opts)
```
```js
[ '-jar',
  '/Users/zavr/node_modules/google-closure-compiler-java/compiler.jar',
  '--compilation_level',
  'ADVANCED',
  '--language_in',
  'ECMASCRIPT_2019',
  '--language_out',
  'ECMASCRIPT_2017',
  '--create_source_map',
  '%outname%.map',
  '--formatting',
  'PRETTY_PRINT',
  '--isolation_mode',
  'IIFE',
  '--warning_level',
  'QUIET',
  '--externs',
  'externs.js',
  '--js_output_file',
  'bundle.js' ]
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/5.svg?sanitize=true" width="25">
</a></p>

## <code><ins>getOutput</ins>(</code><sub><br/>&nbsp;&nbsp;`output: string,`<br/>&nbsp;&nbsp;`src?: string,`<br/></sub><code>): <i>string</i></code>

Returns the location of the output file, even when the directory is given.

```js
import { getOutput } from '@depack/depack'

const file = getOutput('test.js')
console.log('File: %s', file)
const dir = getOutput('output', 'index.js')
console.log('Dir: %s', dir)
```
```js
File: test.js
Dir: output/index.js
```

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/6.svg?sanitize=true" width="25">
</a></p>

## `GOOGLE_CLOSURE_COMPILER: string`

If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/7.svg?sanitize=true" width="25">
</a></p>

## <code>async <ins>getCompilerVersion</ins>(): <i>string</i></code>

If `GOOGLE_CLOSURE_COMPILER` was set using an environment variable, returns `target`, otherwise reads the version from the `google-closure-compiler-java` package.json file.

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/8.svg?sanitize=true">
</a></p>


## Copyright

<table>
  <tr>
    <th>
      <a href="https://artd.eco">
        <img width="100" src="https://raw.githubusercontent.com/wrote/wrote/master/images/artdeco.png"
          alt="Art Deco">
      </a>
    </th>
    <th>© <a href="https://artd.eco">Art Deco</a> for <a href="https://artd.eco/depack">Depack</a> 2019</th>
    <th>
      <a href="https://www.technation.sucks" title="Tech Nation Visa">
        <img width="100" src="https://raw.githubusercontent.com/idiocc/cookies/master/wiki/arch4.jpg"
          alt="Tech Nation Visa">
      </a>
    </th>
    <th><a href="https://www.technation.sucks">Tech Nation Visa Sucks</a></th>
  </tr>
</table>

<p align="center"><a href="#table-of-contents">
  <img src="/.documentary/section-breaks/-1.svg?sanitize=true">
</a></p>