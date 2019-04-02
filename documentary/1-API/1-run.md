```## async run => string
[
  ["args", "Array"],
  ["opts", "RunConfig"]
]
```

Low-level API used by `Compile` and `Bundle`. Spawns _Java_ and executes the compilation. To debug a possible bug in the _GCC_, the sources after each pass can be saved to the file specified with the `debug` command. Also, _GCC_ does not add `// # sourceMappingURL=output.map` comment, therefore it's done by this method. Returns `stdout` of the _Java_ process.

%TYPEDEF types/index.xml%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~ width="25"%