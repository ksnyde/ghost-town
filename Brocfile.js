var filterCoffeeScript = require('broccoli-coffee');
var filterTemplates = require('broccoli-template');
var uglifyJavaScript = require('broccoli-uglify-js');
var compileES6 = require('broccoli-es6-concatenator');
var compileSass = require('broccoli-sass');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var findBowerTrees = require('broccoli-bower');
var env = require('broccoli-env').getEnv();
var instrument = require('broccoli-debug').instrument;
var selectFiles = require('broccoli-select');

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

// STYLE
// -----------------
var templatesTree = pickFiles('theme', {
  srcDir: 'templates',
  destDir: 'public'	
})

// STYLE
// -----------------
var styleAssets = pickFiles('theme/assets/styles', {
	srcDir: '/',
	destDir: '/public/assets/css'
});
// var bourbon = pickFiles('node_modules/node-bourbon/assets/stylesheets');
// bourbon = instrument.print(bourbon);
var processedStyle = compileSass([styleAssets], 'public/assets/css/app.scss', 'public/assets/css/app.css');
processedStyle = instrument.print(processedStyle);

// JAVASCRIPT
// -----------------
var javascriptAssets = pickFiles('theme/assets/javascript', {
	srcDir: '/',
	destDir: '/public/assets/js'
});
javascriptAssets = preprocess(javascriptAssets);

vendorScripts = selectFiles('/bower_components',{
	acceptFiles: ['**/*.js'],
	rejectFiles: [],
	outputDir: '/vendor/js'
})
vendorScripts = instrument.print(vendorScripts);

// FONTS
// -----------------



// EXPORT
// -----------------
module.exports = mergeTrees([templatesTree, processedStyle, javascriptAssets]);