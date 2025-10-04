# Style Dictionary Complete Example

This starter project has everything you need to get started.

## How it works

All of the design tokens and assets are in this package.

To get started, run

Running `npm run build` will compile all of the design tokens into a directory named `eds/` that will house the directory structure for all the SCSS files. If an `eds/` directory already exists, it will delete that and create a brand new one (to avoid old stale tokens staying around).

```
$ npm install
$ npm run build
```

The npm build task is what performs the style dictionary build steps to generate the files for each platform. Every time you change something in the style dictionary, like changing colors or adding design tokens, you will have to run this command again to generate the files.
