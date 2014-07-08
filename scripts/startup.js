#!/usr/bin/env node

// var timepiece = require('broccoli-timepiece/index');
var ghost = require('ghost');
var chimp = require('./MailChimpProxyServer');
var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');

function getTimeString() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec;
}

function broccoliWatcher(destDir, interval) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var watcher = new Watcher(builder, {interval: interval || 100});

  var atExit = function() { builder.cleanup(); };
  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);
  process.on('uncaughtException', atExit);

  watcher.on('change', function(results) {
    rimraf.sync(destDir);
    helpers.copyRecursivelySync(results.directory, destDir);

    console.log(chalk.green("Broccoli build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'), '[' + getTimeString() + ']');
  });

  watcher.on('error', function(err) {
    console.log(chalk.red('\n\nBuild failed.\n'));
  });

  return watcher;
}

function broccoliBuild(destDir) {
    var tree    = broccoli.loadBrocfile();
    var builder = new broccoli.Builder(tree);
    var watcher = new Watcher(builder, {interval: interval || 100});
	
    rimraf.sync(destDir);
    helpers.copyRecursivelySync(results.directory, destDir);
	
}

var env = process.env.NODE_ENV || 'development';
switch(env) {
	case 'development':
		// watch broccoli pipeline
		console.log(chalk.green("Starting broccoli build pipeline\n"));
		broccoliWatcher('public');
		// start ghost server
		ghost().then(function () {
			console.log(chalk.green("ghost blogging service ready\n"));
			var shell = require('child_process').spawn;
			console.log(chalk.green("lauching browser to reverse-proxy site.") + " If the browser is blank start the server with 'sudo nginx' \n");
			shell('open', ['http://127.0.0.1:1080']);
		});
		break;
	case 'production':
		// start ghost
		ghost();		
		// start chimp
		// chimp.listen(4400, function() {
		// 	console.log(chalk.green('MailChimp proxy service started.'));
		// });
		
		break;
}

