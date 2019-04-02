```## async Compile
[
  ["options", "CompileConfig"],
  ["runOptions", "RunConfig"],
  ["compilerArgs?", "Array"]
]
```

Compiles a _Node.JS_ package into a single executable (with the `+x` addition). The last argument, `compilerArgs` can come from the `getOptions` method. The output property should come from `getOutput` method to enable saving to directories without specifying the output filename (_GCC_ will do it automatically, but we need to write source maps and set `+x`).

%TYPEDEF types/compile.xml%

_For example, given the following source:_

%EXAMPLE: example/compile-src%

_The library can be used to start the compilation:_

%EXAMPLE: example/compile, ../src => @depack/depack%
%FORK-js example/compile%

_Stdout:_
%FORKERR example/compile%

%~ width="25"%