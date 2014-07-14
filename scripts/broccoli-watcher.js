#!/usr/bin/env node 
'use strict';

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

function watch(destDir, interval) {
	var tree    = broccoli.loadBrocfile();
	var builder = new broccoli.Builder(tree);
	var watcher = new Watcher(builder, {interval: interval || 100});

	var atExit = function() { builder.cleanup(); };
	process.on('SIGINT', atExit);
	process.on('SIGTERM', atExit);
	process.on('uncaughtException', atExit);

	watcher.on('change', function(results) {
		var tempDir = results.directory + "/tmp";
		rimraf.sync(destDir);
		helpers.copyRecursivelySync(results.directory, destDir);
		console.log(chalk.green("Broccoli build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'), '[' + getTimeString() + ']');
		rimraf.sync(tempDir);
		console.log(chalk.dim("Broccoli temp directory cleared"));
	});

	watcher.on('error', function(err) {
		console.log(chalk.bold.red('\n\nBuild failed:'));
		console.log(chalk.grey(err));
	});

	return watcher;
}

function clear(destDir) {
	destDir = destDir || 'public';
	rimraf.sync(destDir);
}

function build(destDir) {
    var tree    = broccoli.loadBrocfile();
    var builder = new broccoli.Builder(tree);

    rimraf.sync(destDir);
    helpers.copyRecursivelySync('/', destDir);
	console.log(chalk.green("Broccoli built successfully - " + Math.floor(results.totalTime / 1e6) + 'ms'), '[' + getTimeString() + ']');
}

exports.watch = watch;
exports.build = build;
