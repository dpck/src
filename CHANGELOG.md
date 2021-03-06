## 26 February 2020

### [2.2.1](https://github.com/dpck/src/compare/v2.2.0...v2.2.1)

- [fix] Fix for Node 12.

## 28 January 2020

### [2.2.0](https://github.com/dpck/src/compare/v2.1.3...v2.2.0)

- [license] Just use Affero.
- [docs] Update package and add `typedefs.json`.

## 16 November 2019

### [2.1.3](https://github.com/dpck/src/compare/v2.1.2...v2.1.3)

- [fix] Require `@externs/nodejs` and `@depack/nodejs` at runtime only.

### [2.1.2](https://github.com/dpck/src/compare/v2.1.1...v2.1.2)

- [fix] Read lower Node's version of the core builtins.
- [fix] Migrate externs to `@externs/nodejs` org.
- [fix] Merge node_modules in _StaticAnalysis_.

## 29 October 2019

### [2.1.1](https://github.com/dpck/src/compare/v2.1.0...v2.1.1)

- [feature] Support `rel` prop for chunks config (to use for multiple directories instead of _basename_).

## 16 September 2019

### [2.1.0](https://github.com/dpck/src/compare/v2.0.2...v2.1.0)

- [feature] Enable caching for chunks analysis.

## 14 September 2019

### [2.0.2](https://github.com/dpck/src/compare/v2.0.1...v2.0.2)

- [deps] Update `static-analysis`.
- [fix] Check if externs from `package.json` exist.
- [fix] Add the common chunk to output files list.

### [2.0.1](https://github.com/dpck/src/compare/v2.0.0...v2.0.1)

- [feature] Update _Bundle_ to handle linked packages.

## 13 September 2019

### [2.0.0](https://github.com/dpck/src/compare/v1.4.0...v2.0.0)

- [license] Release under Tech Nation Sucks license.

## 12 September 2019

### [1.4.0](https://github.com/dpck/src/compare/v1.3.3...v1.4.0)

- [feature] Add _BundleChunks_ method.
- [doc] Nicer documentation.
- [package] Compile the API with _Depack_.

## 30 July 2019

### [1.3.3](https://github.com/dpck/src/compare/v1.3.2...v1.3.3)

- [fix] Read the `DEPACK_MAX_COLUMNS` env variable.

## 16 July 2019

### [1.3.2](https://github.com/dpck/src/compare/v1.3.1...v1.3.2)

- [fix] Update externs to `^1.4.2`.

## 13 May 2019

### [1.3.1](https://github.com/dpck/src/compare/v1.3.0...v1.3.1)

- [fix] Fullwidth `＠externs/preact` JSDoc.

### [1.3.0](https://github.com/dpck/src/compare/v1.2.2...v1.3.0)

- [feature] Implement the `preactExtern` option to be able to compile JSX with external _Preact_; scan the bundled files for externs.

## 25 April 2019

### [1.2.2](https://github.com/dpck/src/compare/v1.2.1...v1.2.2)

- [fix] Quote externs when reducing _package.json_ fields.

### [1.2.1](https://github.com/dpck/src/compare/v1.2.0...v1.2.1)

- [fix] Fix regex for color printing.

### [1.2.0](https://github.com/dpck/src/compare/v1.1.0...v1.2.0)

- [externs] Publish externs within the `_depack` namespace, tidy up most of the dependencies' types for _GCC_.
- [feature] Update Fix dependencies logic to `main` field when missing but `index.js` is present, and resolve extension (e.g., `"main": "index"`).
- [fix] Shell command (with `\`) for both closure and bundle, as well as in verbose.
- [fix] Include `crypto` for prefixed externs.
- [feature] Library mode with `DEPACK_EXPORT` variable and extern.
- [feature] Warn of JSON files, don't add the `process_common_js_modules` when they are required.
- [deps] Upgrade externs (callable require, module in global, Buffer has static methods and becomes `externs/global/buffer.js`).

## 18 April 2019

### [1.1.0](https://github.com/dpck/src/compare/v1.0.1...v1.1.0)

- [feature] Look up externs from _package.json_ files.
- [feature] Compile &mdash; split command by lines; pass entry point.
- [fix] Check for `jsx` the entry of the bundle.
- [deps] Update `nodejs`, `externs`; fix packages with paths in `bundle`, update `static-analysis` to share `split` with _BundleTransform_.

## 4 April 2019

### [1.0.1](https://github.com/dpck/src/compare/v1.0.0...v1.0.1)

- [deps] Update and unfix dependencies.

## 2 April 2019

### [1.0.0](https://github.com/dpck/src/compare/v0.0.0-pre...v1.0.0)

- [package] Publish the initial release.

## 31 March 2019

### 0.0.0

- Create `@depack/depack` with _[`My New Package`](https://mnpjs.org)_
- [repository]: `src`, `test`