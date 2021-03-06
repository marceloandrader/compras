var filterCoffeeScript = require('broccoli-coffee')
var filterTemplates = require('broccoli-template')
var uglifyJavaScript = require('broccoli-uglify-js')
var compileES6 = require('broccoli-es6-concatenator')
var compileSass = require('broccoli-sass')
var pickFiles = require('broccoli-static-compiler')
var mergeTrees = require('broccoli-merge-trees')
var findBowerTrees = require('broccoli-bower')
var uncss = require('broccoli-uncss');
var env = require('broccoli-env').getEnv()
var writeManifest = require('broccoli-manifest');
var csso = require('broccoli-csso');

function preprocess (tree) {
  tree = filterTemplates(tree, {
    extensions: ['hbs', 'handlebars'],
    compileFunction: 'Ember.Handlebars.compile'
  })
  tree = filterCoffeeScript(tree, {
    bare: true
  })
  return tree
}

var app = 'app'
app = pickFiles(app, {
  srcDir: '/',
  destDir: 'appkit' // move under appkit namespace
})
app = preprocess(app)

var styles = 'styles'
styles = pickFiles(styles, {
  srcDir: '/',
  destDir: 'appkit'
})
styles = preprocess(styles)

var tests = 'tests'
tests = pickFiles(tests, {
  srcDir: '/',
  destDir: 'appkit/tests'
})
tests = preprocess(tests)

var vendor = 'vendor'

var sourceTrees = [app, styles, vendor]
if (env !== 'production') {
  sourceTrees.push(tests)
}
sourceTrees = sourceTrees.concat(findBowerTrees())
//console.log(sourceTrees);
var appAndDependencies = new mergeTrees(sourceTrees, { overwrite: true })

var appJs = compileES6(appAndDependencies, {
  loaderFile: 'loader.js',
  ignoredModules: [
    'ember/resolver'
  ],
  inputFiles: [
    'appkit/**/*.js'
  ],
  legacyFilesToAppend: [
    'knockout.js',
    'localforage.min.js',
    'jquery.js'
  ],
  wrapInEval: env !== 'production',
  outputFile: '/assets/app.js'
})

var appCss = compileSass(sourceTrees, 'appkit/app.scss', 'assets/app.css')

if (env === 'production') {
  appJs = uglifyJavaScript(appJs, {
    // mangle: false,
    // compress: false
  });
  appCss = csso(appCss);
}

var publicFiles = 'public'

if (env === 'production') {
  var completeTree = mergeTrees([appJs, appCss, publicFiles]);
  module.exports = mergeTrees([completeTree, writeManifest(completeTree)])
}
else {
  module.exports = mergeTrees([appJs, appCss, publicFiles])
}
