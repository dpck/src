<typedef name="Bundle" noArgTypesInToc>types/api.xml</typedef>

<typedef narrow>types/bundle.xml</typedef>

_For example, given the following single JS source:_

%EXAMPLE: example/bundle-src%

_Depack is used to make a JS file in ES2015 understood by old browsers:_

%EXAMPLE: example/bundle, ../src => @depack/depack%

_The bundled output:_
%FORK-js example/bundle%

_Stderr:_
%FORKERR-bash example/bundle%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

%~%