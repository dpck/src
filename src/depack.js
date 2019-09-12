import '../types/externs'
import { Compile, Bundle, BundleChunks, run, getOptions, getOutput, getCompilerVersion, GOOGLE_CLOSURE_COMPILER } from './'

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