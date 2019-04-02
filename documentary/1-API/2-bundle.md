```## async Compile
[
  ["options", "BundleConfig"],
  ["compilerArgs?", "Array"]
]
```

Bundles source code into a _JavaScript_ file. If there are _JSX_ dependency, the bundler will transpile them first using [ÀLaMode/JSX](https://github.com/a-la/jsx).

%TYPEDEF types/bundle.xml%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~ width="25"%