<typedef name="Bundle" noArgTypesInToc>types/api.xml</typedef>

<typedef narrow>types/bundle.xml</typedef>

_For example, given the following single JS source:_

%EXAMPLE: example/bundle-src%

_Depack is used to make a JS file in ES2015 understood by old browsers:_

%EXAMPLE: example/bundle, ../src => @depack/depack%

_The bundled output:_
%FORK-js example/bundle%

_Stderr:_
%FORKERR-posh example/bundle%

<!-- %EXAMPLE: example, ../src => @depack/depack%
%FORK example% -->

<pre>
java -jar /Users/zavr/node_modules/google-closure-compiler-java/compiler.jar \
--compilation_level ADVANCED --language_in ECMASCRIPT_2018 --language_out \
ECMASCRIPT_2017 --formatting PRETTY_PRINT --package_json_entry_names module,main \
--entry_point example/compile-src.js --externs node_modules/@depack/externs/v8/os.js \
--externs node_modules/@depack/externs/v8/fs.js --externs \
node_modules/@depack/externs/v8/stream.js --externs \
node_modules/@depack/externs/v8/events.js --externs \
node_modules/@depack/externs/v8/url.js --externs \
node_modules/@depack/externs/v8/global.js --externs \
node_modules/@depack/externs/v8/global/buffer.js --externs \
node_modules/@depack/externs/v8/nodejs.js
Built-ins: os, fs
Running Google Closure Compiler 20190709<img src=".documentary/ellipsis.gif">
</pre>

%~%