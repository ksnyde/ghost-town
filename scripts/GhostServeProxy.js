#!/usr/bin/env node --harmony

var ghost 	 = require('ghost');
var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');
var proxy	 = require('http-proxy');

var options = {
	router: {
		'localhost/chimp': '127.0.0.1:4400',
		'localhost': '127.0.0.1:2368'
	},
	'target': {
		'protocol': 'http'
	}
};

var proxyServer = proxy.createServer(options);
proxyServer.listen(5010);