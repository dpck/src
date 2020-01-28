## compiles a js file
import { createReadStream } from 'fs'
createReadStream('test').pipe(process.stdout)

/* expected */
#!/usr/bin/env node
'use strict';
const fs = require('fs');             const a=fs.createReadStream;a("test").pipe(process.stdout);
/**/