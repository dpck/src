```## async Compile
[
  ["options", "CompileConfig"],
  ["runOptions", "RunConfig"],
  ["compilerArgs?", "Array"]
]
```

Compiles a _Node.JS_ package into a single executable (with the `+x` addition). The last argument, `compilerArgs` can come from the `getOptions` method. The output property should come from `getOutput` method to enable saving to directories without specifying the output filename (_GCC_ will do it automatically, but we need to write source maps and set `+x`).

%TYPEDEF types/compile.xml%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~ width="25"%