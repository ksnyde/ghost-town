var filterCoffeeScript = require('broccoli-coffee');
var filterTemplates = require('broccoli-template');
var uglifyJavaScript = require('broccoli-uglify-js');
var compileES6 = require('broccoli-es6-concatenator');
var concatFiles = require('broccoli-concat');
var compileSass = require('broccoli-sass');
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var findBowerTrees = require('broccoli-bower');
var env = require('broccoli-env').getEnv();
var imageMin = require('broccoli-imagemin');
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
var blogTemplates = pickFiles('theme', {
  srcDir: 'templates',
  destDir: '/'	
})

// STYLE
// -----------------
var styleAssets = pickFiles('theme/assets/styles', {
	srcDir: '/',
	destDir: '/assets/css'
});
var bourbon = 'node_modules/node-bourbon/assets/stylesheets';
var processedStyle = compileSass([styleAssets,bourbon], 'assets/css/theme.scss', 'assets/css/theme.css');
var vendorStyleSources = mergeTrees([
	'bower_components/bootstrap-sass-official/assets/stylesheets/bootstrap',
	'bower_components/font-awesome/css',
	'bower_components/highlightjs/styles'
]);
var vendorStyle = pickFiles(vendorStyleSources,{
	srcDir: '/',
	files: ['*.css'],
	destDir: '/assets/css'
});
vendorStyle = concatFiles(vendorStyle, {
	inputFiles: ['**/*.css'],
	outputFile: '/assets/css/vendor.css',
	header: '/** Vendor CSS files compiled by Thematic Ghost **/',
	footer: '/** end of vendor CSS files compiled by Thematic Ghost **/',
});

// JAVASCRIPT
// -----------------
var templateScripts = pickFiles('theme/assets/javascript', {
	srcDir: '/',
	destDir: '/assets/js'
});
templateScripts = preprocess(templateScripts);

var bootstrap = pickFiles('bower_components/bootstrap-sass-official/assets/javascripts', {
	srcDir: '/',
	files: ['bootstrap.js'],
	destDir: '/assets/js'
});
var velocity = pickFiles('bower_components/velocity', {
	srcDir: '/',
	files: ['jquery.velocity.js', 'velocity.ui.js'],
	destDir: '/assets/js'
});
var highlightjs = pickFiles('bower_components/highlightjs', {
	srcDir: '/',
	files: ['highlight.pack.js'],
	destDir: '/assets/js'
});

var vendorScripts = mergeTrees([bootstrap,velocity,highlightjs]);

// FONTS
// -----------------
var fontSources = mergeTrees([
	'theme/assets/fonts', // locally provided fonts
	'bower_components/bootstrap-sass-official/assets/fonts/bootstrap', 
	'bower_components/font-awesome/fonts'
]);
var fonts = pickFiles(fontSources, {
	srcDir: '/',
	destDir: '/assets/fonts'
});

// IMAGES
// -----------------
var imageSources = mergeTrees([
	'theme/assets/images' // local static images
]);
var images = pickFiles(imageSources, {
	srcDir: '/',
	destDir: '/assets/images'
});
// images = imageMin(images,{
// 	lossyPNG: false,
// 	progressive: true,
// 	optimizationLevel: 3,
// 	interlaced: true
// });

// EXPORT
// -----------------
module.exports = mergeTrees([blogTemplates, processedStyle, vendorStyle, templateScripts, vendorScripts, fonts, images]);