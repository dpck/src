```## async Compile
[
  ["options", "CompileConfig"],
  ["compilerArgs?", "Array"]
]
```

Compiles a _Node.JS_ package into a single executable (with the `+x` addition). The second argument, `compilerArgs` can come from the `getOptions` method. The output value should come from `getOutput` method to enable saving to directories without specifying the output filename.

%TYPEDEF types/compile.xml%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~ width="25"%