## `GOOGLE_CLOSURE_COMPILER: string`

If the `GOOGLE_CLOSURE_COMPILER` was set using the environment variable, it will be returned in this named exported.

%~ width="25"%

```## async getCompilerVersion => string
```

If `GOOGLE_CLOSURE_COMPILER` was set using an environment variable, returns `target`, otherwise reads the version from the `google-closure-compiler-java` package.json file.