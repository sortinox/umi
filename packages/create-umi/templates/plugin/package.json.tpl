{
  "name": "{{{ pluginName }}}",
  "author": "{{{ author }}}",
  "version": "0.0.1",
  "main": "dist/cjs/index.js",
  "types": "dist/cjs/index.d.ts",
  "scripts": {
    "dev": "father dev",
    "build": "father build"
  },
  "keywords": [],
  "authors": {
    "name": "{{{ author }}}",
    "email": "{{{ email }}}"
  },
  "license": "MIT",
  "files": [
    "dist"
  ],
  "devDependencies": {
    "father": "^4.5.0",
    "umi": "^4",
    "@types/node": "^25.1.0",
    "typescript": "^5.9.2",
    "webpack": "^5"
  }
}
