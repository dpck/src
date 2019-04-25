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