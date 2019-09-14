/**
 * @license
 * @depack/depack: Depack Node.JS API for Closure Compiler execution.
 *
 * Copyright (C) 2019 Art Deco
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import '../types/externs'
const { Compile, Bundle, BundleChunks, run, getOptions, getOutput, getCompilerVersion, GOOGLE_CLOSURE_COMPILER } = require('./');

module.exports = {
  '_Compile': Compile,
  '_Bundle': Bundle,
  '_BundleChunks': BundleChunks,
  '_run': run,
  '_getOptions': getOptions,
  '_getOutput': getOutput,
  '_getCompilerVersion': getCompilerVersion,
  '_GOOGLE_CLOSURE_COMPILER': GOOGLE_CLOSURE_COMPILER,
}