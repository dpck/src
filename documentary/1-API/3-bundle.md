```## async Bundle
[
  ["options", "BundleConfig"],
  ["runOptions", "RunConfig"],
  ["compilerArgs?", "Array"]
]
```

Bundles source code into a _JavaScript_ file. If there are _JSX_ dependencies, the bundler will transpile them first using [ÀLaMode/JSX](https://github.com/a-la/jsx).

%TYPEDEF types/bundle.xml%

_For example, given the following single JS source:_

%EXAMPLE: example/bundle-src%

_Depack is used to make a JS file in ES2015 understood by old browsers:_

%EXAMPLE: example/bundle, ../src => @depack/depack%

_The bundled output:_
%FORK-js example/bundle%

_Stderr:_
%FORKERR example/bundle%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~ width="25"%