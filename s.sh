java -jar /Users/zavr/node_modules/google-closure-compiler-java/compiler.jar \
--js s.js --compilation_level ADVANCED \
--output_wrapper "const os = require('os');%output%" \
--language_in ECMASCRIPT_2018 \
--language_out ECMASCRIPT_2017 \