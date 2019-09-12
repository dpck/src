<typedef name="compile" noArgTypesInToc>types/api.xml</typedef>

The actual logic that makes compilation of _Node.JS_ packages possible is:

- Scan the source code and dependency to find out what internal Node.JS modules are used, and creates the output wrapper with `require` calls to require those built-in modules, e.g., `const path = require('path')`.
- Add appropriate [externs](https://github.com/dpck/externs) for the internal modules.
- To make Closure resolve internal imports like `import { join } from 'path'` instead of throwing an error, mock the built-ins in `node_modules` folder. The mocks will reference the variable from the output wrapper generated in step 1:
    ```js
    // node_modules/path/index.js
    export default path
    export * from path
    ```

The last argument, `compilerArgs` can come from the `getOptions` method. The output property should come from `getOutput` method to enable saving to directories without specifying the output filename (_GCC_ will do it automatically, but we need to write source maps and set `+x`).

<typedef narrow>types/compile.xml</typedef>

_For example, given the following source:_

%EXAMPLE: example/compile-src%

_The library can be used to start the compilation:_

%EXAMPLE: example/compile, ../src => @depack/depack%

_The compiled output in pretty format of advanced optimisation:_
%FORK-js example/compile%

_Stderr:_
%FORKERR example/compile%

%~%