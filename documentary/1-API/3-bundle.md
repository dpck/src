<typedef name="Bundle" noArgTypesInToc>types/api.xml</typedef>

<typedef narrow name="BundleBase">types/bundle.xml</typedef>

<typedef narrow name="BundleConfig">types/bundle.xml</typedef>

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

%~%